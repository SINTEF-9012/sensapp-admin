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
				alert(textStatus+":"+errorThrown);
			}
	});
}

function separateNotifiers(allSensors,targetURL,notifierDiv,nonNotifierDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (notifierSensors, textStatus, jqXHR) {
				tableToJqueryDataTable (notifierDiv);
				tableToJqueryDataTable (nonNotifierDiv);
				$.each(allSensors, function (i,sensor) {
					if(notifierSensors.indexOf("/notification/registered/"+sensor.id) != -1) {
						addRowToNotifierDatable(sensor,notifierDiv);
					}
					else {
						addRowToNonNotifierDatable(sensor,nonNotifierDiv);
					}
				});
				resizeDatatable(notifierDiv);
				resizeDatatable(nonNotifierDiv);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
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
				alert(textStatus+":"+errorThrown);
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
				resizeDatatable(notifierTable);
				resizeDatatable(nonNotifierTable);	
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
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
 
function addRowToNonNotifierDatable(sensor,notifierDiv) {
	$('#'+notifierDiv).dataTable().fnAddData( [
		sensor.id,
		sensor.descr,
		timeStampToDate(sensor.creation_date),
		sensor.backend.kind,
		createNonNotifierActions(sensor).html()] );
}

//*********************************
// Notifier Table Functions
//**********************************

function deleteNotifier(targetURL,sensor,row,notifierTable,nonNotifierTable,topology) {
	$.ajax({
		type: "delete",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				addToNonNotifierTableById(getURL(topology,"registry","/registry/sensors/"+sensor),row,notifierTable,nonNotifierTable);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
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
				addRowToNotifierDatable(sensor,notifierTable);
				removeRow(row,nonNotifierTable);
				resizeDatatable(notifierTable);
				resizeDatatable(nonNotifierTable);				
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
 }
 
function addRowToNotifierDatable(sensor,notifierTable) {
	$('#'+notifierTable).dataTable().fnAddData( [
		sensor.id,
		sensor.descr,
		timeStampToDate(sensor.creation_date),
		sensor.backend.kind,
		createNotifierActions(sensor).html()] );
}
 
function createNotifierActions(sensor) {
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
				.attr("href","#")
				.attr("onclick","deleteNotifier(getURL(topology,'notifier','/notification/registered/"+sensor.id+"'),'"+sensor.id+"',this.parentNode.parentNode,'notifierTable','nonNotifierTable',topology);")
				.attr("class","btn btn-danger")
				.text("Remove As Notifier")
		);	
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
				alert(textStatus+":"+errorThrown);
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