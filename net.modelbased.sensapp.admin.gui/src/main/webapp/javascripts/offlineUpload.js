function loadFile(targetURL,inputDiv) {
    var input, file, fr;
	var progress = $('#'+inputDiv).find('#progressBar');
	progress.css("width","0%");
	progress.parent().show();
    if (typeof window.FileReader !== 'function') {
        showAlert("p", "The file API isn't supported on this browser yet.");
        return;
    }

    input = $('#'+inputDiv).find('input').get(0);
    if (!input) {
        alertMessage("error","Um, couldn't find the fileinput element.",5000);
    }
    else if (!input.files) {
        alertMessage("error","This browser doesn't seem to support the `files` property of file inputs",5000);
    }
    else if (!input.files[0]) {
        alertMessage("error","Please select a file before clicking 'Load'",5000);
    }
    else {
        file = input.files[0];
        fr = new FileReader();
		fr.onprogress = updateProgress;
        fr.onload = receivedText;
        fr.readAsText(file);
    }

    function receivedText() {
	    progress.css("width",'100%');
		progress.parent().hide();
		putToSensApp(targetURL,fr.result);
    }
}

function updateProgress (evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      // Increase the progress bar length.
      if (percentLoaded < 100) {
        progress.css("width",percentLoaded + '%');
      }
    }
  }

 //put readed file to SensApp
function putToSensApp (targetURL,senmlString) {

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		data: senmlString,
		success: function (data,textStatus,jqXHR) {
			alertMessage("success","File successfully loaded",5000);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
		}
	});

}