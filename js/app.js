PDFJS.workerSrc = "js/pdf.worker.js";

// Take array of text objects from PDF.JS and generate our sheet structure
function generatePageDataArray(text) {
	return [
		/* start_date */ text[0].str.match(/: (.*) -/)[1],
		/* end_date */ text[0].str.split("- ")[1],
		/* product_name */ text[7].str,
		/* states */ text[7].str.substring(0,2),
		/* group_rating_areas */ text[2].str.slice(-1),
		/* zero_eighteen */ text[15].str,
		/* nineteen_twenty */ text[15].str,
		/* twenty_one */ text[21].str,
		/* twenty_two */ text[27].str,
		/* twenty_three */ text[33].str,
		/* twenty_four */ text[39].str,
		/* twenty_five */ text[45].str,
		/* twenty_six */ text[51].str,
		/* twenty_seven */ text[57].str,
		/* twenty_eight */ text[63].str,
		/* twenty_nine */ text[69].str,
		/* thirty */ text[75].str,
		/* thirty_one */ text[81].str,
		/* thirty_two */ text[87].str,
		/* thirty_three */ text[93].str,
		/* thirty_four */ text[99].str,
		/* thirty_five */ text[17].str,
		/* thirty_six */ text[23].str,
		/* thirty_seven */ text[29].str,
		/* thirty_eight */ text[35].str,
		/* thirty_nine */ text[41].str,
		/* forty */ text[47].str,
		/* forty_one */ text[53].str,
		/* forty_two */ text[59].str,
		/* forty_three */ text[65].str,
		/* forty_four */ text[71].str,
		/* forty_five */ text[77].str,
		/* forty_six */ text[83].str,
		/* forty_seven */ text[89].str,
		/* forty_eight */ text[95].str,
		/* forty_nine */ text[101].str,
		/* fifty */ text[19].str,
		/* fifty_one */ text[25].str,
		/* fifty_two */ text[31].str,
		/* fifty_three */ text[37].str,
		/* fifty_four */ text[43].str,
		/* fifty_five */ text[49].str,
		/* fifty_six */ text[55].str,
		/* fifty_seven */ text[61].str,
		/* fifty_eight */ text[67].str,
		/* fifty_nine */ text[73].str,
		/* sixty */ text[79].str,
		/* sixty_one */ text[85].str,
		/* sixty_two */ text[91].str,
		/* sixty_three */ text[97].str,
		/* sixty_four */ text[103].str,
		/* sixty_five_plus */ text[103].str
	];
}

// Return a promise to extract data from all files
// Promise resolves when all map operations have resolved
function extractDataFromFiles(files) {
	return Promise.all(Array.from(files).map(extractDataFromPDF));
}


// Return a promise to extract data from a single page
function extractDataFromPage(pdf, i) {
	return new Promise(function(resolve, reject){
		pdf.getPage(i).then(function(page){
			page.getTextContent().then(function(content){
				// Resolve page promise with data array from page content
				resolve(generatePageDataArray(content.items));
			});
		});
	});
}

// Return a promise to extract data from a given file
// Promise resolves when text has been extracted from each page and placed into an array
function extractDataFromPDF(file) {
	return new Promise(function(resolve, reject) {
		var pdfReader = new FileReader();
		pdfReader.onload = function(e){
			pdfData = new Uint8Array(e.target.result);
			// Load document into PDF.JS
			PDFJS.getDocument(pdfData).then(function(pdf){
				// Create an array of promises
				var pagePromises = [];
				// Iteration is needed because PDF.JS does not expose an array of all pages
				for(var i = 1; i <= pdf.numPages; i++){
					// For each page, make a new promise
					pagePromises.push(extractDataFromPage(pdf,i));
				}
				// Resolve the file promise with a promise to resolve all the page promises
				resolve(Promise.all(pagePromises));
			});
		};
		pdfReader.onerror = pdfReader.onabort = reject;
		// Get content of PDF file
		pdfReader.readAsArrayBuffer(file);
	});
}

function processFiles() {
	// Show loading gif
	loadingGif = document.getElementById("loading_gif");
	loadingGif.style.display = "inline";
	// There should only be one template file submitted
	var templateFile = document.getElementById("xlsx_template").files[0];
	XlsxPopulate.fromDataAsync(templateFile).then(function(workbook) {
		// Get FileList (not array) of submitted PDFs
		var pdfFiles = document.getElementById("pdf_data").files;
		// Load each PDF file into a PDFJS object
		extractDataFromFiles(pdfFiles).then(function(results){
			// Flatten returned array into a 2D array
			var data = results.reduce((a,b) => a.concat(b), []);
			// Add data from PDF files to submitted XLSX template
			workbook.sheet(0).cell("A2").value(data);
			// Download new file from browser
			workbook.outputAsync().then(function(blob) {
	            var url = window.URL.createObjectURL(blob);
	            var a = document.createElement("a");
	            document.body.appendChild(a);
	            a.href = url;
	            a.download = "BeneFix Small Group Plans.xlsx";
	            a.click();
	            window.URL.revokeObjectURL(url);
	            document.body.removeChild(a);
	            // Hide loading gif
	            loadingGif.style.display = "none";
	    	});
		});
    });
}