//div is tbody
function getAllSensors (targetURL,topology,div) {
	$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				if (data!=[]) {
					displayAllSensors(data,div);
					getNotifierInfos(getURL(topology,"notifier","/notification/registered"));
				}
				tableToJqueryDataTable (div);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function getNotifierSensors(targetURL,div) {

		$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (notifiers, textStatus, jqXHR) {
				
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});

}

function getNotifierInfos (targetURL) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				$.each(data, function(i,element) {
					pattern = "/notification/registered/";
					var splitted = element.split(pattern);
					var sensor = splitted[splitted.length-1];
					var elem = document.getElementById(sensor);
					if(elem!=null) {
						displayNotifierYes(sensor);
					}
				});
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

//displayType = 1 -> Info
//displayType = 2 -> Edit
function getMoreInfos(targetURL,div,displayType) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				switch (displayType) {
					case 1:
						displayMoreInfos (data,div);
						break;
					case 2:
						fillInputValues(data);
						break;
					default:
						break;
				}
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});	

}

function postSensor(targetURL,postData) {

	$.ajax({
		type: "post",
		url: targetURL,
		async:false,
		contentType: "application/json",
		data: JSON.stringify(postData),
		success: function (data,textStatus,jqXHR) {
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function postNotifier(targetURL,postData) {

	$.ajax({
		type: "post",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(postData),
		success: function (data,textStatus,jqXHR) {
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function deleteSensor(targetURL) {
	$.ajax({
		type: "delete",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function updateSensorMetaData (targetURL,putData) {		 
	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(putData),
		success: 
			function (data, textStatus, jqXHR) {
			},
		error: function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function getSensorToPost() {

	var data = 	{
	"id" : document.getElementById("id").value,
	"descr" : document.getElementById("descr").value,
	"schema" : { "backend" : document.getElementById("backend").value, "template": document.getElementById("template").value}
	};
	alert(document.getElementById("id").value);
	return data;

}

function getHooksToPost() {


}

function registerSensor() {
	var postData = getSensorToPost();
	var topology = getTopology();
	postSensor(getURL(topology,"registry","/registry/sensors"),postData);
}