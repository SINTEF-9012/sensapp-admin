//*********************************
// Main Table Functions
//**********************************

function getAllSensors (targetURL,div) {
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
	
	var sensorArray = new Array();
	var sensorColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Creation Date"},{"sTitle":"Actions"}];
	
	$.each(data,function (i,sensor) {

		sensorArray.push([createNameColumn(sensor.id,"sensor").html(),
						  createDescriptionColumn(sensor,"sensor").html(),
						  timeStampToDate(sensor.creation_date),
						  createSensorActions(sensor).html()]);
	});
	tableToJqueryDataTable (sensorArray,sensorColumns,table);


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
				.attr("onclick","getMoreInputInfos(getURL(getTopology(),'registry','/registry/sensors/"+sensor.id+"'),'edit-Sensor')")
				.attr("data-toggle","modal")
				.attr("class","btn")
				.text("Edit")
		)
		.append(' ')
			//Delete Button
		.append(
			$(document.createElement('a'))
				.attr("href","#delete-Sensor")
				.attr("data-toggle","modal")
				.attr("onclick","getDeleteInfos('"+sensor.id+"',this.parentNode.parentNode,'delete-Sensor','dataTable')")
				.attr("class","btn btn-danger")
				.html("<b style='font-size:16px'>&times;</b>")
		);
}

//*********************************
// Add Modal Functions
//**********************************

function registerSensor(formDiv,tableDiv) {
		var postData = getSensorToPost(formDiv);
		postSensor(getURL(getTopology(),"registry","/registry/sensors"),postData,formDiv,tableDiv);
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

function updateSensorMetaData (targetURL,descr,metaData,tableDiv) {		 

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		data: JSON.stringify(metaData),
		success: 
			function (data, textStatus, jqXHR) {
				updateSensorDescr(targetURL,descr,tableDiv);

			},
		error: function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
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
				clearEditModal('edit-Sensor');
				alertMessage("success","Information Updated",5000);
			},
		error: function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}
 
function rewriteDescr(data,tableDiv) {

	colId = $('#'+tableDiv).find("th:contains('Description')").index();
	rowId = $('#'+tableDiv).find("tr").has("td:contains('"+data.id+"')").index();

	$('#'+tableDiv).find("tbody").find("tr").eq(rowId).find("td").eq(colId).html(createDescriptionColumn(data,"sensor").html());
	$('#'+tableDiv).dataTable().$("div[rel=popover]").popover({placement:'right'});

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
			$('#'+div).find('#form').find('tbody')
				.append(
					$(document.createElement('tr'))
						.attr('id',i+'TagRow')
						.append(
							$(document.createElement('td'))
								.attr("style","font-weight:bold;")
								.attr('id',i+'ExistingTagField')
								.append(
									$(document.createElement('span'))
										.text(i))
								.append(" :"))
						.append(
							$(document.createElement('td'))
								.attr('id',i+'TagValue')
								.append(
									$(document.createElement('input'))
										.attr("class","input-medium search-query")
										.attr("value",element))	
								.append(' ')
								.append(
									$(document.createElement('b'))
										.attr("class","btn btn-danger")
										.css("font-size","16px")
										.unbind('click').click( function () {
											$(this).closest('tr').remove();
										})
										.html("&times;"))
						)
				);
		});
	}
}

function clearEditModal(div) {
	$('#'+div).find('#title').empty();
	$('#'+div).find('tr[id$="TagRow"]').remove();
	$('#'+div).find('#descr').attr("value","");
	$('#'+div).find('#update_time').attr("value","");
	$('#'+div).find('#longitude').attr("value","");
	$('#'+div).find('#latitude').attr("value","");
}

function updateSensor(id,formDiv,tableDiv) {
	updateSensorMetaData(getURL(getTopology(),"registry","/registry/sensors/"+id),getJSONDescr(formDiv),getSensorInfosToPut(formDiv),tableDiv);
}

//*********************************
// Delete Modal Functions
//**********************************

function getDeleteInfos(sensorId,row,modalDiv,table) {
	$('#'+modalDiv).find('h2').text("Delete " + sensorId + " ?");
	$('#'+modalDiv).find('#delete').unbind('click').click( function () {
		deleteSensor(getURL(getTopology(),'registry','/registry/sensors/'+sensorId),row,table);
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
	$.each($('#'+div).find('td[id$="ExistingTagField"]').find('span'),function(i,element) {
		fields.push($(element).text());
		values.push($(this).closest('td').next('td').find('input').val());
	});
	$.each($('#'+div).find('td[id$="NonExistingTagField"]').find('input[value!=""]'),function(i,element) {
		fields.push($(element).val());
		values.push($(this).closest('td').next('td').find('input').val());
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