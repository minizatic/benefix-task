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
						for(var i = 1; i <= pdf.numPages; i++){
							template = extractData(pdf.getPage(i), template);
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

	function extractData(pdf, xlsx) {
		// extract data from pdf and place into xlsx
	}

	// Process the Excel and PDF files when submit button is clicked
	$("#submit_files").on("click", processFiles);
});