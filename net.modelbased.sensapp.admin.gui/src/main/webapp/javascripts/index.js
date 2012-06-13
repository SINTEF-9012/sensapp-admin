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
				tableToJqueryDataTable (div);
				if (data.length!=0) {
					displayAllSensors(data,div);
				}
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function displayAllSensors(data,div) {
	$.each(data, function(i,element) {
		addRowToSensorDataTable(element,div);
	});
}

function addRowToSensorDataTable(sensor,sensorDiv) {
	$('#'+sensorDiv).dataTable().fnAddData( [
		sensor.id,
		sensor.descr,
		timeStampToDate(sensor.creation_date),
		sensor.backend.kind,
		createSensorActions(sensor).html()] );
	
	//write the jquery function associated to popovers
	$('body').append(
			$(document.createElement('script')).append("$(function() {$('#"+sensorDiv+"').find('#"+sensor.id+"-Infos').popover({placement:'top'});});")
	);
	
}
	
function addNewSensorRowToSensorDataTable(sensor,sensorDiv) {
	$('#'+sensorDiv).dataTable().fnAddData( [
		sensor.id,
		sensor.descr,
		timeStampToDate(sensor.creation_date),
		sensor.schema.backend,
		createSensorActions(sensor).html()] );
	}	

function deleteSensor(targetURL,row,table) {
	$.ajax({
		type: "delete",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				removeRow(row,table);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function createSensorActions(sensor) {

	var popoverContent = "";
	if(sensor.infos.update_time!=null) {
		popoverContent = popoverContent + "<li>Update time : " + sensor.infos.update_time + "</li>";
	}

	if(sensor.infos.loc!=null) {
		if(sensor.infos.loc.longitude!=null) {
			popoverContent = popoverContent + "<li>Longitude Loc : " + sensor.infos.loc.longitude + "</li>";
		}
		if(sensor.infos.loc.latitude!=null) {
			popoverContent = popoverContent + "<li>Latitude Loc : " + sensor.infos.loc.latitude + "</li>";
		}
	}
	if(sensor.infos.tags!=null) {
		$.each(sensor.infos.tags, function(i,element) {
			popoverContent = popoverContent + "<li>"+i+" : " + element + "</li>";
		});
	}

	return $(document.createElement('td'))
		.append(	
			//More Infos Button
			$(document.createElement('a'))
				.attr("class","btn")
				.attr("id",sensor.id+"-Infos")
				.attr("href","#")
				.attr("rel","popover")
				.attr("data-content",popoverContent)
				.attr("data-original-title","Additional Infos")
				.text("+ Infos")
		)
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
				.attr("href","#edit-Sensor")
				.attr("onclick","deleteSensor(getURL(topology,'registry','/registry/sensors/"+sensor.id+"'),this.parentNode.parentNode,'dataTable');")
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
				alert(textStatus+":"+errorThrown);
			}
	});
}

function putSensorMetaData (targetURL,putData,sensorDiv,formDiv) {		 

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		data: JSON.stringify(putData),
		success: 
			function (data, textStatus, jqXHR) {
				addRowToSensorDataTable(data,sensorDiv);
				clearAddModal(formDiv);
			},
		error: function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
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
				alert(textStatus+":"+errorThrown);
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
			},
		error: function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function rewriteMetaData(data,tableDiv) {

	colId = $('#'+tableDiv).find("th:contains('Actions')").index();
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
	//alert(popoverContent);
	$('#'+tableDiv).find("tbody").find("tr").eq(rowId).find("td").eq(colId).find("#"+data.id+"-Infos").attr("data-content",popoverContent);

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
				alert(textStatus+":"+errorThrown);
			}
	});
}
 
function rewriteDescr(data,tableDiv) {

	colId = $('#'+tableDiv).find("th:contains('Description')").index();
	rowId = $('#'+tableDiv).find("tr").has("td:contains('"+data.id+"')").index();

	$('#'+tableDiv).find("tbody").find("tr").eq(rowId).find("td").eq(colId).text(data.descr);

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