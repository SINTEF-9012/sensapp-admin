function reset() {	var registryServer = getURL(getTopology(),'registry','');	var sensorURL = getURL(getTopology(),'registry','/registry/sensors');	$.ajax({		type: "get",		url: sensorURL,		contentType: "application/json",		dataType:'json',		success: 			function (data, textStatus, jqXHR) {				//to break everything is always fun				$.each(data,function(i,sensor){					deleteSensor(i,data.length,registryServer+sensor);				});		},		error: 			function (jqXHR, textStatus, errorThrown) {				alertMessage("error",errorThrown,5000);			}	});	var compositeURL = getURL(getTopology(),'registry','/registry/composite/sensors');		$.ajax({		type: "get",		url: compositeURL,		contentType: "application/json",		dataType:'json',		success: 			function (data, textStatus, jqXHR) {				//but you have to do it well				$.each(data,function(i,sensor){					deleteSensor(i,data.length,registryServer+sensor);			});		},		error: 			function (jqXHR, textStatus, errorThrown) {				alertMessage("error",errorThrown,5000);			}	});	}function deleteSensor(currentSize,totalSize,targetURL) {	$.ajax({		type: "delete",		url: targetURL,	});}