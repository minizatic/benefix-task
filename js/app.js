PDFJS.workerSrc = "js/pdf.worker.js";

// Take array of text objects from PDF.JS and generate our sheet structure
function generatePageDataObject(text) {
	return {
		"start_date": text[0].str.match(/: (.*) -/)[1],
		"end_date": text[0].str.split("- ")[1],
		"product_name": text[7].str,
		"states": text[7].str.substring(0,2),
		"group_rating_areas": text[2].str.slice(-1),
		"zero_eighteen": text[15].str,
		"nineteen_twenty": text[15].str,
		"twenty_one": text[21].str,
		"twenty_two": text[27].str,
		"twenty_three": text[33].str,
		"twenty_four": text[39].str,
		"twenty_five": text[45].str,
		"twenty_six": text[51].str,
		"twenty_seven": text[57].str,
		"twenty_eight": text[63].str,
		"twenty_nine": text[69].str,
		"thirty": text[75].str,
		"thirty_one": text[81].str,
		"thirty_two": text[87].str,
		"thirty_three": text[93].str,
		"thirty_four": text[99].str,
		"thirty_five": text[17].str,
		"thirty_six": text[23].str,
		"thirty_seven": text[29].str,
		"thirty_eight": text[35].str,
		"thirty_nine": text[41].str,
		"forty": text[47].str,
		"forty_one": text[53].str,
		"forty_two": text[59].str,
		"forty_three": text[65].str,
		"forty_four": text[71].str,
		"forty_five": text[77].str,
		"forty_six": text[83].str,
		"forty_seven": text[89].str,
		"forty_eight": text[95].str,
		"forty_nine": text[101].str,
		"fifty": text[19].str,
		"fifty_one": text[25].str,
		"fifty_two": text[31].str,
		"fifty_three": text[37].str,
		"fifty_four": text[43].str,
		"fifty_five": text[49].str,
		"fifty_six": text[55].str,
		"fifty_seven": text[61].str,
		"fifty_eight": text[67].str,
		"fifty_nine": text[73].str,
		"sixty": text[79].str,
		"sixty_one": text[85].str,
		"sixty_two": text[91].str,
		"sixty_three": text[97].str,
		"sixty_four": text[103].str,
		"sixty_five_plus": text[103].str
	};
}

// Return a promise to extract data from all files
// Promise resolves when all map operations have resolved
function extractDataFromFiles(files) {
	return Promise.all(Array.from(files).map(extractDataFromPDF));
}

// Return a promise to extract data from a given file
// Promise resolves when text has been extracted from each page and placed into an array
function extractDataFromPDF(file) {
	return new Promise(function(resolve, reject) {
		var pageDataArray = [];
		var pdfReader = new FileReader();
		pdfReader.onload = function(){
			pdfData = new Uint8Array(this.result);
			// Load document into PDF.JS
			PDFJS.getDocument(pdfData).then(function(pdf){
				// Iterate over each page and push its content to the global array
				for(var i = 1; i <= pdf.numPages; i++){
					pdf.getPage(i).then(function(page){
						page.getTextContent().then(function(content){
							pageDataArray.push(generatePageDataObject(content.items));
						});
					});
				}
				// When data from all pages have been extracted, resolve the promise
				resolve(pageDataArray);
			});
		};
		pdfReader.onerror = pdfReader.onabort = reject;
		// Get content of PDF file
		pdfReader.readAsArrayBuffer(file);
	});
}

function processFiles() {
	// There should only be ony template file submitted
	var templateFile = document.getElementById("xlsx_template").files[0];
	var reader = new FileReader();
	reader.onload = function(){
		// When excel file has been loaded into memory, read it into a SheetJS object
		var data = new Uint8Array(this.result);
		var template = XLSX.read(data, {type: "array"});
		var sheetName = template.SheetNames[0];
		// Get FileList (not array) of submitted PDFs
		var pdfFiles = document.getElementById("pdf_data").files;
		// Load each PDF file into a PDFJS object
		extractDataFromFiles(pdfFiles).then(function(results){
			// Add data from PDF files to submitted XLSX template
			XLSX.utils.sheet_add_json(template.Sheets[sheetName], results, {skipHeader: true, origin: "A2"});
			// Download new file from browser
			XLSX.writeFile(template, "BeneFix Small Group Plans.xlsx");
		});
	};
	// Get contents of excel file
	reader.readAsArrayBuffer(templateFile);
}