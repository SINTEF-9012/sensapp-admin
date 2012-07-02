//*********************************
// Init Functions
//**********************************

function getNotificationInformations(targetURL,notifierDiv,nonNotifierDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (allSensors, textStatus, jqXHR) {
				separateNotifiers(getURL(getTopology(),"notifier","/notification/registered?flatten=true"),allSensors,notifierDiv,nonNotifierDiv);	
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function separateNotifiers(targetURL,allSensors,notifierTable,nonNotifierTable) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (notifierSensors, textStatus, jqXHR) {
				var notifiersArray = new Array();
				var nonNotifiersArray = new Array();
				var notifiersColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Creation Date"},{"sTitle":"Actions"}];
				var nonNotifiersColumms = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Creation Date"},{"sTitle":"Actions"}];
				$.each(allSensors, function (i,sensor) {
					var isNotifier=false;
					var i=0;
					while(isNotifier == false && i<notifierSensors.length) {
						if(notifierSensors[i].sensor==sensor.id) {
							isNotifier=true;				
						}
						i++;
					}
					if(isNotifier==false) {
						nonNotifiersArray.push([createNameColumn(sensor.id,"sensor").html(),
												createDescriptionColumn(sensor,"sensor").html(),
												timeStampToDate(sensor.creation_date),
												createNonNotifierActions(sensor).html()]);
					}
					else {
						notifiersArray.push([createNameColumn(sensor.id,"notifier").html(),
							 createDescriptionColumn(sensor,"notifier").html(),
							 timeStampToDate(sensor.creation_date),
							 createNotifierActions(sensor,notifierTable,nonNotifierTable).html()]);
					}
				});			
				tableToJqueryDataTable (notifiersArray,notifiersColumns,notifierTable);
				tableToJqueryDataTable (nonNotifiersArray,nonNotifiersColumms,nonNotifierTable);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});	

}

//*********************************
// Non Notifier Table Functions
//**********************************

function registerNotifier(sensorName,row,notifierTable,nonNotifierTable) {

	$.ajax({
		type: "post",
		url: getURL(getTopology(),"notifier","/notification/registered"),
		contentType: "application/json",
		data: JSON.stringify(getNotifierToPost(sensorName)),
		success: function (data,textStatus,jqXHR) {
			addToNotifierTableById(getURL(getTopology(),"registry","/registry/sensors/"+postData.sensor),row,notifierTable,nonNotifierTable);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function addToNonNotifierTableById(targetURL,row,notifierTable,nonNotifierTable) {
 
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (sensor, textStatus, jqXHR) {
				addRowToNonNotifierDatable(sensor,nonNotifierTable);
				removeRow(row,notifierTable);
				$('#'+nonNotifierTable).dataTable().$("div[rel=popover]").popover({placement:'right'});
				alertMessage("success","Notifier removed",5000);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function createNonNotifierActions(sensor) {
	return $(document.createElement('td'))
		.append(	
			//Add To Notifier Button
			$(document.createElement('a'))
				.attr("class","btn btn-primary")
				.attr("href","#")
				.attr("onclick","registerNotifier('"+sensor.id+"',this.parentNode.parentNode,'notifierTable','nonNotifierTable')")
				.text("Add To Notifiers")
		);	
}
 
function addRowToNonNotifierDatable(sensor,nonNotifierTable) {
	$('#'+nonNotifierTable).dataTable().fnAddData( [
		createNameColumn(sensor.id,"sensor").html(),
		createDescriptionColumn(sensor,"sensor").html(),
		timeStampToDate(sensor.creation_date),
		createNonNotifierActions(sensor).html()] );
}

//*********************************
// Notifier Table Functions
//**********************************

function deleteNotifier(targetURL,sensorId,row,notifierTable,nonNotifierTable) {
	$.ajax({
		type: "delete",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				addToNonNotifierTableById(getURL(getTopology(),"registry","/registry/sensors/"+sensorId),row,notifierTable,nonNotifierTable);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function addToNotifierTableById(targetURL,row,notifierTable,nonNotifierTable) {
 
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (sensor, textStatus, jqXHR) {
				addRowToNotifierDatable(sensor,notifierTable,nonNotifierTable);
				removeRow(row,nonNotifierTable);
				$('#'+notifierTable).dataTable().$("div[rel=popover]").popover({placement:'right'});
				alertMessage("success",sensor.id +" registered as notifier",5000);				
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
 }
 
function addRowToNotifierDatable(sensor,notifierTable,nonNotifierTable) {
	$('#'+notifierTable).dataTable().fnAddData( [
		createNameColumn(sensor.id,"notifier").html(),
		createDescriptionColumn(sensor,"notifier").html(),
		timeStampToDate(sensor.creation_date),
		createNotifierActions(sensor,notifierTable,nonNotifierTable).html()] );
}
 
function createNotifierActions(sensor,notifierTable,nonNotifierTable) {
	return $(document.createElement('td'))
		.append(	
			//View Hooks Button
			$(document.createElement('a'))
				.attr("class","btn")
				.attr("id",sensor.id+"-Hooks")
				.attr("href","#hook-Modal")
				.attr("data-toggle","modal")
				.attr("onclick","getHookList(getURL(getTopology(),'notifier','/notification/registered/"+sensor.id+"'),'hook-Modal')")
				.text("Manage Hooks")
		)
		.append(' ')
		.append(
			//Remove As Notifier Button
			$(document.createElement('a'))
				.attr("href","#delete-Sensor")
				.attr("data-toggle","modal")
				.attr("onclick","getDeleteInfos('"+sensor.id+"',this.parentNode.parentNode,'delete-Sensor','"+notifierTable+"','"+nonNotifierTable+"');")
				.attr("class","btn btn-danger")
				.html("<b style='font-size:16px'>&times;</b>")
		);	
}

function getDeleteInfos (sensorId,row,modalDiv,notifierTable,nonNotifierTable) {
	$('#'+modalDiv).find('h2').text("Delete " + sensorId + " ?");
	$('#'+modalDiv).find('#delete').unbind('click').click( function () {
			deleteNotifier(getURL(getTopology(),'notifier','/notification/registered/'+sensorId),sensorId,row,notifierTable,nonNotifierTable);
	});
}


//*********************************
// Hooks Admin Functions
//**********************************

//Init Modal
function getHookList(targetURL,hookModal) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				displayHookModal(data,hookModal);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function displayHookModal(notifier,hookModal) {

	$('#'+hookModal).find('h2').text("Hook list of "+notifier.sensor);
	$('#'+hookModal).find('#register').attr("onclick","registerHooks('"+hookModal+"','"+notifier.sensor+"');clearHookModal('"+hookModal+"')");
	
	$.each(notifier.hooks,function(i,hook) {
		addRowToHookDatable(hook,hookModal);
	});
}

function addRowToHookDatable(hook,hookModal) {
	$('#'+hookModal).find('tbody')
		.append($(document.createElement('tr'))
			.append($(document.createElement('td'))
					.text(hook))
			.append($(document.createElement('td'))
					.append(
						$(document.createElement('button'))
							.attr("class","btn btn-danger")
							.click( function () {
								$(this).closest('tr').remove();
							})
							.css("font-size","16px")
							.css("font-weight","bold")
							.html("&times;")))
		);
}

function clearHookModal(modalDiv) {
	$("#"+modalDiv).find('tbody').empty();
	$("#"+modalDiv).find('input').val("");
}

function registerHooks(modalDiv,sensorId) {

	//get the hooks to put
	var hookList = new Array();
	$.each($("#"+modalDiv).find('table>tbody>tr>td:nth-child(1)'),function (i,hook) {
		hookList.push(hook.innerHTML);
	});

	//put the hooks
	$.ajax({
		type: "put",
		contentType: "application/json",
		async:false,
		url: getURL(getTopology(),"notifier","/notification/registered/"+sensorId),
		data: JSON.stringify({"sensor":sensorId,"hooks":hookList}),
		success: 
			function (data, textStatus, jqXHR) {
				alertMessage("success","Hooks updated",5000);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
	
}


//*********************************
// Get JSON functions
//**********************************

function getNotifierToPost(sensorName) {
	var data = { "sensor" : sensorName,"hooks":[]};
	return data;
}