function getCompositeInformations(targetURL,compositeId,containedTable,sensorTable) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (allSensors, textStatus, jqXHR) {
				separateContained(allSensors,getURL(topology,"notifier","/registry/composite/sensors/"+compositeId),containedTable,sensorTable);	
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function separateContained(allSensors,targetURL,containedTable,sensorTable) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (compositeInfos, textStatus, jqXHR) {
				var containedArray = new Array();
				var othersArray = new Array();		

				$.each(allSensors, function (i,sensor) {
					if(compositeInfos.sensors.indexOf("/registry/sensors/"+sensor.id) != -1) {
						containedList = compositeInfos.sensors;
						containedArray.push([createNameColumn(sensor.id,"sensor").html(),
											 createDescriptionColumn(sensor,"sensor").html(),
											 createContainedActions(sensor.id,containedTable,sensorTable).html()]);
					}
					else {
						othersArray.push([createNameColumn(sensor.id,"sensor").html(),
												createDescriptionColumn(sensor,"sensor").html(),
												createSensorActions(sensor,containedTable,sensorTable).html()]);
					}
				});

				$('#'+containedTable).dataTable().fnClearTable();
				$('#'+sensorTable).dataTable().fnClearTable();						
				$('#'+containedTable).dataTable().fnAddData(containedArray);
				$('#'+sensorTable).dataTable().fnAddData(othersArray);
				$('#'+containedTable).dataTable().$("div[rel=popover]").popover({placement:'right'});
				$('#'+sensorTable).dataTable().$("div[rel=popover]").popover({placement:'right'});
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});	

}


//*********************************
// Composite Table Functions
//**********************************

function getAllComposite(targetURL,compositeTable,containedTable,sensorTable) {
	
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: function (data,textStatus,jqXHR) {
				if (data.length!=0) {
					displayAllComposite(data,compositeTable,containedTable,sensorTable);
				}		
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});

}
 
function displayAllComposite(data,compositeTable,containedTable,sensorTable) {

	var compositeArray = new Array();
	var compositeColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Actions"}];

	$.each(data,function (i,sensor) {
		compositeArray.push([createNameColumn(sensor.id,"composite").html(),
							 createDescriptionColumn(sensor,"composite").html(),
							 createCompositeActions(sensor,compositeTable,containedTable,sensorTable).html()]);
	});
	tableToJqueryDataTable(compositeArray,compositeColumns,compositeTable);
}

function createCompositeActions(sensor,compositeTable,containedTable,sensorTable) {
	return $(document.createElement('td'))
			.append(
				//View Button
				$(document.createElement('button'))
					.attr("class","btn")
					.attr("onclick","dispatchSensors('"+sensor.id+"','"+containedTable+"','"+sensorTable+"');currentComposite='"+sensor.id+"'")
					.text("Manage Content")
			)
			.append(	
				//Remove Button
				$(document.createElement('a'))
					.attr("class","btn btn-danger")
					.attr("href","#delete-Sensor")
					.attr("data-toggle","modal")
					.attr("onclick","getDeleteInfos('"+sensor.id+"',this.parentNode.parentNode,'delete-Sensor','"+compositeTable+"')")
					.text("Delete")
			);	
}

function getDeleteInfos (sensorId,row,modalDiv,table) {
	$('#'+modalDiv).find('h2').text("Delete " + sensorId + " ?");
	$('#'+modalDiv).find('#delete').unbind('click').click( function () {
		removeComposite(getURL(topology,'registry','/registry/composite/sensors/'+sensorId),row,table)
	});
}

function dispatchSensors (sensorId,containedTable,sensorTable) {
		$('#tablesDiv').find('#contained').find('h2').text("Sensors of "+sensorId);
		getCompositeInformations(getURL(topology,'registry','/registry/sensors?flatten=true'),sensorId,containedTable,sensorTable);
		$('#tablesDiv').find('#all').show();
		$('#tablesDiv').find('#contained').show();
		$('#tablesDiv').find('#composite').hide();
	}

function addRowToCompositeDatable(sensor,compositeTable,containedTable,sensorTable) {
	$('#'+compositeTable).dataTable().fnAddData( [
		createNameColumn(sensor.id,"composite").html(),
		createDescriptionColumn(sensor,"composite").html(),
		createCompositeActions(sensor,containedTable,sensorTable).html()] );
}

function removeComposite(targetURL,row,compositeTable) {
	
	$.ajax({
		type: "delete",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
			removeRow(row,compositeTable);
			alertMessage("success","Sensor deleted",5000);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}


//*********************************
// Contained Table Functions
//**********************************

function addRowToContainedDataTable (sensor,containedTable,sensorTable) {
	$('#'+containedTable).dataTable().fnAddData([
		createNameColumn(sensor.id,"sensor").html(),
		createDescriptionColumn(sensor,"sensor").html(),
		createContainedActions(sensor.id,containedTable,sensorTable).html()]);
}

function addRowToContainedDataTableById(targetURL,containedTable,sensorTable) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
				addRowToContainedDataTable(data,containedTable,sensorTable);
				$('#'+containedTable).dataTable().$("div[rel=popover]").popover({placement:'right'});			
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}


function createContainedActions(sensorId,containedTable,sensorTable) {
	return 	$(document.createElement('label'))
				.attr("class","checkbox")
				.append(
						$(document.createElement('a'))
						.attr("id",sensorId+"-Out")
						.attr("onclick","removeRow($(this).closest('tr').get(0),'"+containedTable+"');addRowToSensorDatatableById(getURL(topology,'registry','/registry/sensors/"+sensorId+"'),'"+containedTable+"','"+sensorTable+"');containedList.splice('/registry/sensors/"+sensorId+"',1);")
						.attr("class","btn btn-danger")
						.text("Eject")
				);
}

function deleteSelectedSensors(targetURL,containedDiv) {

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(selectedList),
		success: function (data,textStatus,jqXHR) {
			deleteSelectedRows(containedDiv);
			selectedList = new Array();
			alertMessage("success","Selected sensors are removed from composite",5000);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function deleteSelectedRows(containedDiv) {	
	$.each($('#'+containedDiv).find('table').find(':checked'), function (i,element) {
		removeRow($(element).closest('tr').get(0),$('#'+containedDiv).find('table').attr("id"));
	});
}

//*********************************
// Simple Sensors Table Functions
//**********************************

/*function getAllSensors (targetURL,containedTable,sensorTable) {
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (data, textStatus, jqXHR) {
				if (data.length!=0) {
					displayAllSensors(data,containedTable,sensorTable);
				}
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function displayAllSensors(data,containedTable,sensorTable) {

	var sensorArray = new Array();
	var sensorColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Creation Date"},{"sTitle":"Select"}];
	
	$.each(data,function (i,sensor) {
		sensorArray.push([createNameColumn(sensor.id,"sensor").html(),
						  createDescriptionColumn(sensor,"sensor").html(),
						  timeStampToDate(sensor.creation_date),
						  createSensorActions(sensor,containedTable,sensorTable).html()]);
	});
	
	var sensorDisplay = { "aaData": sensorArray, "aoColumn": sensorColumns};
				
	$('#'+sensorTable).dataTable(sensorDisplay).$("div[rel=popover]").popover({placement:'right'});
	
}*/

function addRowToSensorDatatableById(targetURL,containedTable,sensorTable) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
			addRowToSensorDatatable(data,containedTable,sensorTable);
			$('#'+sensorTable).dataTable().$("div[rel=popover]").popover({placement:'right'});				
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});

}

function addRowToSensorDatatable (sensor,containedTable,sensorTable) {

	$('#'+sensorTable).dataTable().fnAddData( [
		createNameColumn(sensor.id,"sensor").html(),
		createDescriptionColumn(sensor,"sensor").html(),
		createSensorActions(sensor,containedTable,sensorTable).html()] );
}


function createSensorActions(sensor,containedTable,sensorTable) {

	return $(document.createElement('div'))
		.append(
			$(document.createElement('a'))
			.attr("class","btn btn-primary")
			.attr("onclick","removeRow($(this).closest('tr').get(0),'"+sensorTable+"');addRowToContainedDataTableById(getURL(topology,'registry','/registry/sensors/"+sensor.id+"'),'"+containedTable+"','"+sensorTable+"');containedList.push('/registry/sensors/"+sensor.id+"');")
			.text("Add")
		);

}

function putSensors(targetURL) {

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(containedList),
		success: function (data,textStatus,jqXHR) {
			alertMessage("success","Sub-sensors updated",5000);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function addSensorToList (sensorId,sensorDiv) {

	if ($('#'+sensorDiv).find('#'+sensorId+"-Checkbox").is(':checked'))	{
		selectedList.push("/registry/sensors/"+sensorId);
	}
	else {
		  selectedList = jQuery.grep(selectedList, function(value) {
		  return value != "/registry/sensors/"+sensorId;
		});
	}
}

//*********************************
// Post Composite Modal Functions
//**********************************

function registerComposite(topology,formDiv,compositeTable,containedTable,sensorTable) {
		var postData = getCompositeToPost(formDiv);
		postComposite(getURL(topology,"registry","/registry/composite/sensors"),postData,compositeTable,containedTable,sensorTable);
		clearAddModal(formDiv);
	}

function postComposite(targetURL,postData,compositeTable,containedTable,sensorTable) {

	$.ajax({
		type: "post",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(postData),
		success: function (data,textStatus,jqXHR) {
			addRowToCompositeDatable(postData,compositeTable,containedTable,sensorTable);
			$('#'+compositeTable).dataTable().$("div[rel=popover]").popover({placement:'right'});
			alertMessage("success",postData.id +" created",5000);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function clearAddModal(div) {
	$('#'+div).find('tr[id$="TagRow"]').remove();
	$('#'+div).find('input').attr("value","");
}

//*********************************
// Get JSON functions
//**********************************

function getCompositeToPost(div) {

	return 	{ "id": $('#'+div).find('#id').attr('value'),
	"descr" : $('#'+div).find('#descr').attr('value'),
	"tags" : getTags(div),
	"sensors":[]
	};
}

function getTags(div) {

	var fields = new Array();
	var values = new Array();
	$.each($('#'+div).find('td[id$="TagField"]').has('input'),function(i,element) {
		fields.push($(element).find('input').attr('value'));
	});
	$.each($('#'+div).find('td[id$="TagField"]').not('input'),function(i,element) {
		fields.push($(element).text());
	});
	$.each($('#'+div).find('td[id$="TagValue"]'),function(i,element) {
		values.push($(element).find('input').attr('value'));
	});
	jsonString = '{'
	if(fields.length!=0) {
		jsonString += '"'+fields[0]+'":"'+values[0]+'"';
		for(var i=1;i<fields.length && i<values.length;i++) {
			jsonString += ',"'+fields[i]+'":"'+values[i]+'"';
		}
	}
	jsonString += "}";

	return eval('(' + jsonString + ')');

}