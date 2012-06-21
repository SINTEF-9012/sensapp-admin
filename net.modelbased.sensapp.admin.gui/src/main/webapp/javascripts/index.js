//*********************************
// Main Table Functions
//**********************************

function getAllSensors (targetURL,topology,div) {
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (data, textStatus, jqXHR) {
				if (data.length!=0) {
					displayAllSensors(data,div);
				}
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function displayAllSensors(data,table) {
	/*$.each(data, function(i,element) {
		addRowToSensorDataTable(element,div);
	});*/
	
	var sensorArray = new Array();
	var sensorColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Creation Date"},{"sTitle":"Actions"}];
	
	$.each(data,function (i,sensor) {

		sensorArray.push([createNameColumn(sensor.id,"sensor").html(),
						  createDescriptionColumn(sensor,"sensor").html(),
						  timeStampToDate(sensor.creation_date),
						  createSensorActions(sensor).html()]);
	});
	tableToJqueryDataTable (sensorArray,sensorColumns,table);
//	var sensorDisplay = { "aaData": sensorArray,	"aoColumn": sensorColumns};
//	$('#'+table).dataTable(sensorDisplay).$("div[rel=popover]").popover({placement:'right'});

}

function addRowToSensorDataTable(sensor,sensorTable) {
	$('#'+sensorTable).dataTable().fnAddData( [
		createNameColumn(sensor.id,"sensor").html(),
		createDescriptionColumn(sensor,"sensor").html(),
		timeStampToDate(sensor.creation_date),
		createSensorActions(sensor).html()] );
}



function createSensorActions(sensor) {

	return $(document.createElement('td'))
		.append(
			//Edit Button
			$(document.createElement('a'))
				.attr("href","#edit-Sensor")
				.attr("onclick","getMoreInputInfos(getURL(topology,'registry','/registry/sensors/"+sensor.id+"'),'edit-Sensor')")
				.attr("data-toggle","modal")
				.attr("class","btn")
				.text("Edit")
		)
		.append(
			//Delete Button
			$(document.createElement('a'))
				.attr("href","#delete-Sensor")
				.attr("data-toggle","modal")
				.attr("onclick","getDeleteInfos('"+sensor.id+"',this.parentNode.parentNode,'delete-Sensor','dataTable')")
				.attr("class","btn btn-danger")
				.text("Delete")
		);
}

//*********************************
// Add Modal Functions
//**********************************

function registerSensor(topology,formDiv,tableDiv) {
		var postData = getSensorToPost(formDiv);
		postSensor(getURL(topology,"registry","/registry/sensors"),postData,formDiv,tableDiv);
	}

function postSensor(targetURL,postData,formDiv,tableDiv) {

	$.ajax({
		type: "post",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(postData),
		success: function (data,textStatus,jqXHR) {
			var putData = getSensorInfosToPut(formDiv);
			putSensorMetaData(targetURL+"/"+postData.id,putData,tableDiv,formDiv);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function putSensorMetaData (targetURL,putData,sensorTable,formDiv) {		 

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		data: JSON.stringify(putData),
		success: 
			function (data, textStatus, jqXHR) {
				addRowToSensorDataTable(data,sensorTable);
				$('#'+sensorTable).dataTable().$("div[rel=popover]").popover({placement:'right'});
				clearAddModal(formDiv);
				alertMessage("success",data.id +" successfully added",5000);
			},
		error: function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function clearAddModal(div) {
	$('#'+div).find('tr[id$="TagRow"]').remove();
	$('#'+div).find('input').attr("value","");
}

//*********************************
// Edit Modal Functions
//**********************************

function getMoreInputInfos(targetURL,div) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				fillInputValues(data,div);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});	
}

function updateSensorMetaData (targetURL,putData,tableDiv) {		 

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		data: JSON.stringify(putData),
		success: 
			function (data, textStatus, jqXHR) {
				rewriteMetaData(data,tableDiv);
				clearEditModal('edit-Sensor');
				alertMessage("success","Information Updated",5000);
			},
		error: function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function rewriteMetaData(data,tableDiv) {

	colId = $('#'+tableDiv).find("th:contains('Description')").index();
	rowId = $('#'+tableDiv).find("tr").has("td:contains('"+data.id+"')").index();

	var popoverContent = "";
	if(data.infos.update_time!=null) {
		popoverContent = popoverContent + "<li>Update time : " + data.infos.update_time + "</li>";
	}

	if(data.infos.loc!=null) {
		if(data.infos.loc.longitude!=null) {
			popoverContent = popoverContent + "<li>Longitude Loc : " + data.infos.loc.longitude + "</li>";
		}
		if(data.infos.loc.latitude!=null) {
			popoverContent = popoverContent + "<li>Latitude Loc : " + data.infos.loc.latitude + "</li>";
		}
	}
	if(data.infos.tags!=null) {
		$.each(data.infos.tags, function(i,element) {
			popoverContent = popoverContent + "<li>"+i+" : " + element + "</li>";
		});
	}	

	$('#'+tableDiv).find("tbody").find("tr").eq(rowId).find("td").eq(colId).find('div').attr("data-content",popoverContent);
}

function updateSensorDescr (targetURL,putData,tableDiv) {		 

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		data: JSON.stringify(putData),
		success: 
			function (data, textStatus, jqXHR) {
				rewriteDescr(data,tableDiv);
			},
		error: function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}
 
function rewriteDescr(data,tableDiv) {

	colId = $('#'+tableDiv).find("th:contains('Description')").index();
	rowId = $('#'+tableDiv).find("tr").has("td:contains('"+data.id+"')").index();

	$('#'+tableDiv).find("tbody").find("tr").eq(rowId).find("td").eq(colId).find('div').text(data.descr);

}
 
 function fillInputValues(data,div) {

	$('#'+div).find('#title').append(data.id);

	$('#'+div).find('#id').attr('value',data.id);
	if(typeof data.descr !='undefined'){
		$('#'+div).find('#descr').attr('value',data.descr);
	}
	$('#'+div).find('#creation_date').attr('value', timeStampToDate(data.creation_date));
	$('#'+div).find('#kind').attr('value',data.backend.kind);
	
	if(typeof data.infos.update_time != 'undefined'){
		$('#'+div).find('#update_time').attr('value',data.infos.update_time);
	}
 	if(typeof data.infos.loc != 'undefined'){
		if(typeof data.infos.loc.longitude != 'undefined') {
			$('#'+div).find('#longitude').attr('value',data.infos.loc.longitude);
		}
		if(typeof data.infos.loc.latitude != 'undefined') {
			$('#'+div).find('#latitude').attr('value',data.infos.loc.latitude);
		}
	}
	if(typeof data.infos.tags != 'undefined'){
		$.each(data.infos.tags, function(i,element) {
			var newRow = $(document.createElement('tr'))
				.attr('id',i+'TagRow');
			var customField = $(document.createElement('td'))
				.attr("style","font-weight:bold;").append(i + " :")
				.attr('id',i+'TagField');
			var customValue = $(document.createElement('td'));
			var input = $(document.createElement('input'))
				.attr('id',i+'TagValue')
				.attr("class","input-medium search-query")
				.attr("value",element);
			customValue.append(input);		
			var cross = $(document.createElement('b'))
				.attr("class","btn btn-danger")
				.attr("onclick","removeElement('"+i+"TagRow','"+div+"')")
				.text("X");
			customValue.append(cross);
			newRow.append(customField);
			newRow.append(customValue);
			$('#'+div).find('#form').find('tbody').append(newRow);
		});
	}
}

function clearEditModal(div) {
	$('#'+div).find('#title').empty();
	$('#'+div).find('tr[id$="TagRow"]').remove();
	$('#'+div).find('#update_time').attr("value","");
	$('#'+div).find('#longitude').attr("value","");
	$('#'+div).find('#latitude').attr("value","");
}

function updateSensor(id,topology,formDiv,tableDiv) {
	var putData = getSensorInfosToPut(formDiv);
	updateSensorMetaData(getURL(topology,"registry","/registry/sensors/"+id),putData,tableDiv);
	var descr = getJSONDescr(formDiv);
	updateSensorDescr(getURL(topology,"registry","/registry/sensors/"+id),descr,tableDiv);
}

//*********************************
// Delete Modal Functions
//**********************************

function getDeleteInfos(sensorId,row,modalDiv,table) {
	$('#'+modalDiv).find('h2').text("Delete " + sensorId + " ?");
	$('#'+modalDiv).find('#delete').unbind('click').click( function () {
		deleteSensor(getURL(topology,'registry','/registry/sensors/'+sensorId),row,table);
	});
}

function deleteSensor(targetURL,row,table) {

	$.ajax({
		type: "delete",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				removeRow(row,table);
				alertMessage("success","Sensor deleted",5000);
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

function getSensorToPost(div) {
	return	{
	"id" : $('#'+div).find('#id').attr('value'),
	"descr" : $('#'+div).find('#descr').attr('value'),
	"schema" : { "backend" : $('#'+div).find('#backend').attr('value'), "template":  $('#'+div).find('#template').attr('value')}
	};
}

function getSensorInfosToPut(div) {

	return 	{
	"tags" : getTags(div),
	"update_time": parseInt($('#'+div).find('#update_time').attr('value')),
	"loc" : { "longitude" : parseFloat($('#'+div).find('#longitude').attr('value')), "latitude": parseFloat($('#'+div).find('#latitude').attr('value'))}
	};
}

function getJSONDescr(div) {
	return {
	"descr": $('#'+div).find('#descr').attr('value')
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