//*********************************
// Composite Table Functions
//**********************************

function getAllComposite(targetURL,selectList,compositeTable) {
	
	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
				tableToJqueryDataTable (compositeTable);
				if (data.length!=0) {
					displayAllComposite(data,selectList,compositeTable);
				}		
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});

}
 
function displayAllComposite(data,selectList,compositeTable) {
	$.each(data, function(i,sensor) {
		addRowToCompositeDatable(sensor,compositeTable);
		fillSelect(sensor,selectList);
	});
	sortOptionList(selectList);
}

function fillSelect(sensor,selectList) {
	$('#'+selectList).append(
		$(document.createElement("option"))
			.attr("id",sensor.id)
			.text(sensor.id)
	);
}

function sortOptionList(selectId) {
	// get the select
	var $dd = $('#'+selectId);
	if ($dd.length > 0) { // make sure we found the select we were looking for
		// save the selected value
		var selectedVal = $dd.val();
		// get the options and loop through them
		var $options = $('option', $dd);
		var arrVals = [];
		$options.each(function(){
			// push each option value and text into an array
			arrVals.push({
				val: $(this).val(),
				text: $(this).text()
			});
		});
		// sort the array by the value (change val to text to sort by text instead)
		arrVals.sort(function(a, b){
			return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
		});
		
		// loop through the sorted array and set the text/values to the options
		for (var i = 0, l = arrVals.length; i < l; i++) {
			$($options[i]).val(arrVals[i].val).text(arrVals[i].text);
		}
		// set the selected value back
		$dd.val(selectedVal);
	}
}

function createCompositeActions(sensor) {

	var popoverContent = "";

	if(sensor.tags!=null) {
		$.each(sensor.tags, function(i,element) {
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
				//View Button
				$(document.createElement('a'))
					.attr("class","btn")
					.attr("href","#contained")
					.attr("onclick","createContainedTable(getURL(topology,'registry','/registry/composite/sensors/"+sensor.id+"'),'"+sensor.id+"','contained');$('#tablesDiv').find('#all').hide();")
					.text("View Contained Sensors")
			)
			.append(	
				//Remove Button
				$(document.createElement('a'))
					.attr("class","btn btn-danger")
					.attr("href","#")
					.attr("onclick","removeComposite(getURL(topology,'registry','/registry/composite/sensors/"+sensor.id+"'),'"+sensor.id+"',this.parentNode.parentNode,'compositeList','compositeTable')")
					.text("Remove")
			);	
}

function addRowToCompositeDatable(sensor,compositeTable) {
	$('#'+compositeTable).dataTable().fnAddData( [
		sensor.id,
		sensor.descr,
		createCompositeActions(sensor).html()] );
		
	//write the jquery function associated to popovers
	$('body').append(
			$(document.createElement('script')).append("$(function() {$('#"+sensor.id+"-Infos').popover({placement:'top'});});")
	);
}

function removeComposite(targetURL,sensorId,row,compositeList,compositeTable) {
	
	$.ajax({
		type: "delete",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
			removeRow(row,compositeTable);
			removeListItem(sensorId,compositeList);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
}

function removeListItem(sensorId,compositeList) {
	$('#'+compositeList).find('#'+sensorId).remove();
}

//*********************************
// Contained Table Functions
//**********************************

function createContainedTable(targetURL,sensorId,containedDiv) {
	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
				containedTable = $('#'+containedDiv).find('table')[0];
				$(containedTable).dataTable().fnClearTable();
				selectedList = data.sensors;
				if (data.length!=0) {
					displayContainedSensors(data,containedTable.id);
				}
				$('#'+containedDiv).show();
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
	
	$('#'+containedDiv).find("#deleteButton").attr("onclick","deleteSelectedSensors('"+targetURL+"','contained');");
	
} 

function displayContainedSensors(data,containedTable) {

	$.each(data.sensors, function (i,element) {
		var split = element.split("/registry/sensors/");
		addRowToContainedDataTable(split[split.length-1],containedTable);
	});
}

function addRowToContainedDataTable (element,containedTable) {
	$('#'+containedTable).dataTable().fnAddData([
		element,
		createContainedSelection(element).html()]);
}

function createContainedSelection(sensorId) {
	return 	$(document.createElement('label'))
				.attr("class","checkbox")
				.append(
						$(document.createElement('input'))
						.attr("type","checkbox")
						.attr("id",sensorId+"-Checkbox")
						.attr("onclick","deleteSensorFromList('"+sensorId+"','contained')")
						.attr("class","checkbox")
				);
}

function deleteSensorFromList (sensorId,sensorDiv) {

	if ($('#'+sensorDiv).find('#'+sensorId+"-Checkbox").is(':checked'))	{
		  selectedList = jQuery.grep(selectedList, function(value) {
		  return value != "/registry/sensors/"+sensorId;
		});
	}
	else {
		selectedList.push("/registry/sensors/"+sensorId);
	}
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
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
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

function getAllSensors (targetURL,div) {
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
		createSensorActions(sensor).html(),
		createSensorSelect(sensor).html()] );
	
	//write the jquery function associated to popovers
	$('body').append(
			$(document.createElement('script')).append("$(function() {$('#"+sensorDiv+"').find('#"+sensor.id+"-Infos').popover({placement:'top'});});")
	);
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
		);
}

function createSensorSelect(sensor) {

	return $(document.createElement('label'))
		.attr("class","checkbox")
		.attr("align","center")
		.append(
			$(document.createElement('input'))
				.attr("type","checkbox")
				.attr("class","checkbox")
				.attr("id",sensor.id+"-Checkbox")
				.attr("onclick","addSensorToList('"+sensor.id+"','all')")
		);
}

function addSelectedSensors(targetURL,sensorDiv) {
	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
			selectedList = $.merge(selectedList,data.sensors);
			selectedList.sort();
			for(var i=1;i<selectedList.length;i++) {
				if(selectedList[i-1]==selectedList[i]) {
					selectedList.splice(i,1);
				}
			}
			putSelectedSensors(targetURL,sensorDiv);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});	
}

function putSelectedSensors(targetURL,sensorDiv) {

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(selectedList),
		success: function (data,textStatus,jqXHR) {
			selectedList = new Array();
			$('#'+sensorDiv).find('table').find(':checked').attr('checked',false);
			$('#'+sensorDiv).find('#successAlert').show();
			window.setTimeout(function() { $('#'+sensorDiv).find('#successAlert').hide(); }, 4000);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
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

function registerComposite(topology,formDiv,selectList,compositeTable) {
		var postData = getCompositeToPost(formDiv);
		postComposite(getURL(topology,"registry","/registry/composite/sensors"),postData,selectList,compositeTable);
		clearAddModal(formDiv);
	}

function postComposite(targetURL,postData,selectList,compositeTable) {

	$.ajax({
		type: "post",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(postData),
		success: function (data,textStatus,jqXHR) {
			addRowToCompositeDatable(postData,compositeTable);
			fillSelect(postData,selectList);
			sortOptionList(selectList);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
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