//*********************************
// Init Functions
//**********************************

function getNotificationInformations(targetURL,topology,notifierDiv,nonNotifierDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (allSensors, textStatus, jqXHR) {
				separateNotifiers(allSensors,getURL(topology,"notifier","/notification/registered"),notifierDiv,nonNotifierDiv);	
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function separateNotifiers(allSensors,targetURL,notifierTable,nonNotifierTable) {

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
					if(notifierSensors.indexOf("/notification/registered/"+sensor.id) != -1) {
						notifiersArray.push([createNameColumn(sensor.id,"notifier").html(),
											 createDescriptionColumn(sensor,"notifier").html(),
											 timeStampToDate(
											 sensor.creation_date),
											 createNotifierActions(sensor,notifierTable,nonNotifierTable).html()]);
					}
					else {
						nonNotifiersArray.push([createNameColumn(sensor.id,"sensor").html(),
												createDescriptionColumn(sensor,"sensor").html(),
												timeStampToDate(sensor.creation_date),
												createNonNotifierActions(sensor).html()]);
					}
				});
				var notifiersDisplay = { "aaData": notifiersArray, "aoColumn": notifiersColumns};
				var nonNotifiersDisplay = { "aaData": nonNotifiersArray, "aoColumn": nonNotifiersColumms};
				
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

function registerNotifier(sensorName,topology,row,notifierTable,nonNotifierTable) {
	var postData = getNotifierToPost(sensorName);
	postNotifier(getURL(topology,"notifier","/notification/registered"),postData,row,notifierTable,nonNotifierTable,topology);
}

function postNotifier(targetURL,postData,row,notifierTable,nonNotifierTable,topology) {

	$.ajax({
		type: "post",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(postData),
		success: function (data,textStatus,jqXHR) {
			addToNotifierTableById(getURL(topology,"registry","/registry/sensors/"+postData.sensor),row,notifierTable,nonNotifierTable);
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
				.attr("onclick","registerNotifier('"+sensor.id+"',topology,this.parentNode.parentNode,'notifierTable','nonNotifierTable',topology)")
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
				addToNonNotifierTableById(getURL(topology,"registry","/registry/sensors/"+sensorId),row,notifierTable,nonNotifierTable);
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
				.attr("onclick","getHookList(getURL(topology,'notifier','/notification/registered/"+sensor.id+"'),'hook-List')")
				.text("View Hooks")
		)
		.append(
			//Remove As Notifier Button
			$(document.createElement('a'))
				.attr("href","#delete-Sensor")
				.attr("data-toggle","modal")
				.attr("onclick","getDeleteInfos('"+sensor.id+"',this.parentNode.parentNode,'delete-Sensor','"+notifierTable+"','"+nonNotifierTable+"');")
				.attr("class","btn btn-danger")
				.text("Remove As Notifier")
		);	
}

function getDeleteInfos (sensorId,row,modalDiv,notifierTable,nonNotifierTable) {
	$('#'+modalDiv).find('h2').text("Delete " + sensorId + " ?");
	$('#'+modalDiv).find('#delete').unbind('click').click( function () {
			deleteNotifier(getURL(topology,'notifier','/notification/registered/'+sensorId),sensorId,row,notifierTable,nonNotifierTable);
	});
}


//*********************************
// Hooks Admin Functions
//**********************************

function getHookList(targetURL,hookTable) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				var hookList = data.hooks; 
				displayHookList(hookList,hookTable);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function displayHookList(hookList,hookTable) {
	$.each(hookList,function(i,hook) {
	addRowToHookDatable(hook,hookTable);
	});
}

function addRowToHookDatable(hook,hookTable) {
	$('#'+hookTable).dataTable().fnAddData( [
	hook,
	createHookActions(hook).innerHTML] );
}

function createHookActions(hook) {
	return $(document.createElement('td'))
				.text("Button");		
}

//*********************************
// Get JSON functions
//**********************************

function getNotifierToPost(sensorName) {
	var data = { "sensor" : sensorName,"hooks":[]};
	return data;
}