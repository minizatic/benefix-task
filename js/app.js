$(function(){
	PDFJS.workerSrc = 'js/pdf.worker.js';

	function processFiles(event) {
		event.preventDefault();
		var templateFile = $("#xlsx_template").prop("files")[0];
		reader = new FileReader();
		reader.onload = function(){
			// When excel file has been loaded into memory, read it into a SheetJS object
			var data = new Uint8Array(this);
			var template = XLSX.read(data, {type: "array"});

			var pdfFiles = $("#pdf_data").prop("files");
			// Load each PDF file into a PDFJS object
			$.each(pdfFiles, function(){
				var pdfReader = new FileReader();
				pdfReader.onload = function(){
					pdfData = new Uint8Array(this.result);
					var loadingTask = PDFJS.getDocument(pdfData).then(function(pdf){
						var pageDataArray = [];
						for(var i = 1; i <= pdf.numPages; i++){
							pdf.getPage(i).then(function(page){
								page.getTextContent().then(function(content){
									var text = content.items;
									var pageData = {
										start_date: text[0].str.match(/: (.*) -/)[1],
										end_date: text[0].str.split("- ")[1],
										product_name: text[7].str,
										states: text[7].str.substring(0,2),
										group_rating_areas: text[2].str.slice(-1),
										zero_eighteen: text[15].str,
										nineteen_twenty: text[15].str,
										twenty_one: text[21].str,
										twenty_two: text[27].str,
										twenty_three: text[33].str,
										twenty_four: text[39].str,
										twenty_five: text[45].str,
										twenty_six: text[51].str,
										twenty_seven: text[57].str,
										twenty_eight: text[63].str,
										twenty_nine: text[69].str,
										thirty: text[75].str,
										thirty_one: text[81].str,
										thirty_two: text[87].str,
										thirty_three: text[93].str,
										thirty_four: text[99].str,
										thirty_five: text[17].str,
										thirty_six: text[23].str,
										thirty_seven: text[29].str,
										thirty_eight: text[35].str,
										thirty_nine: text[41].str,
										forty: text[47].str,
										forty_one: text[53].str,
										forty_two: text[59].str,
										forty_three: text[65].str,
										forty_four: text[71].str,
										forty_five: text[77].str,
										forty_six: text[83].str,
										forty_seven: text[89].str,
										forty_eight: text[95].str,
										forty_nine: text[101].str,
										fifty: text[19].str,
										fifty_one: text[25].str,
										fifty_two: text[31].str,
										fifty_three: text[37].str,
										fifty_four: text[43].str,
										fifty_five: text[49].str,
										fifty_six: text[55].str,
										fifty_seven: text[61].str,
										fifty_eight: text[67].str,
										fifty_nine: text[73].str,
										sixty: text[79].str,
										sixty_one: text[85].str,
										sixty_two: text[91].str,
										sixty_three: text[97].str,
										sixty_four: text[103].str,
										sixty_five_plus: text[103].str
									};
								});
							});
						}
					}, function(err){
						console.log(err);
					});
				}
				pdfReader.readAsArrayBuffer(this);
			});
		};
		// Get contents of excel file
		reader.readAsArrayBuffer(templateFile);
	}

	// Process the Excel and PDF files when submit button is clicked
	$("#submit_files").on("click", processFiles);
});