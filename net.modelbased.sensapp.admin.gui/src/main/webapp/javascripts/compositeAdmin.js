//Called When Compsite Selected
function getCompositeInformations(targetURL,compositeId,containedDiv,sensorDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (allSensorsURL, textStatus, jqXHR) {
				separateContained(getURL(getTopology(),"registry","/sensapp/registry/composite/sensors/"+compositeId),allSensorsURL,containedDiv,sensorDiv);	
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function separateContained(targetURL,allSensorsURL,containedDiv,sensorDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (compositeInfos, textStatus, jqXHR) {
				var containedArray = new Array();
				var othersArray = new Array();
				var counter = 0;
				$.each(allSensorsURL, function (i,sensorURL) {
					if(compositeInfos.sensors.indexOf(sensorURL)==-1) {
						getPushOtherSensorInfos(sensorURL,othersArray,containedDiv,sensorDiv);						
					}
					else {
						containedList = compositeInfos.sensors;
						getPushContainedSensorInfos(sensorURL,containedArray,containedDiv,sensorDiv);
					}
				});
				$('#'+containedDiv).find('table').dataTable().fnClearTable();
				$('#'+sensorDiv).find('table').dataTable().fnClearTable();						
				$('#'+containedDiv).find('table').dataTable().fnAddData(containedArray);
				$('#'+sensorDiv).find('table').dataTable().fnAddData(othersArray);
				$('#'+containedDiv).find('table').dataTable().$("div[rel=popover]").popover({placement:'right'});
				$('#'+sensorDiv).find('table').dataTable().$("div[rel=popover]").popover({placement:'right'});
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});	

}

function getPushOtherSensorInfos(targetURL,othersArray,containedDiv,sensorDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (sensor, textStatus, jqXHR) {
				addRowToSensorDatatable(sensor,containedDiv,sensorDiv);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function getPushContainedSensorInfos(targetURL,containedArray,containedDiv,sensorDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: 
			function (sensor, textStatus, jqXHR) {
				addRowToContainedDataTable (sensor,containedDiv,sensorDiv);
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

//Init Main Page
function getAllComposite(targetURL,compositeDiv,containedDiv,sensorDiv) {
	
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		success: function (data,textStatus,jqXHR) {
				if (data.length!=0) {
					displayAllComposite(data,compositeDiv,containedDiv,sensorDiv);
				}		
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});

}
 
function displayAllComposite(data,compositeDiv,containedDiv,sensorDiv) {

	var compositeArray = new Array();
	var compositeColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Actions"}];

	$.each(data,function (i,sensor) {
		compositeArray.push([createNameColumn(sensor.id,getURL(getTopology(),"registry","/sensapp/registry/composite/sensors/"+sensor.id)).html(),
							 createDescriptionColumn(sensor,"composite").html(),
							 createCompositeActions(sensor,compositeDiv,containedDiv,sensorDiv).html()]);
	});

	tableToJqueryDataTable(compositeArray,compositeColumns,$('#'+compositeDiv).find('table').attr('id'));
}

function createCompositeActions(sensor,compositeDiv,containedDiv,sensorDiv) {
	return $(document.createElement('td'))
			.append(
				//View Button
				$(document.createElement('button'))
					.attr("class","btn")
					.attr("onclick","dispatchSensors('"+sensor.id+"','"+compositeDiv+"','"+containedDiv+"','"+sensorDiv+"');currentComposite='"+sensor.id+"'")
					.text("Manage Content")
			)
			.append(' ')
			.append(
				//Edit Button
				$(document.createElement('a'))
					.attr("class","btn")
					.attr("href","#edit-Composite")
					.attr("data-toggle","modal")
					.attr("onclick","getEditInfos(getURL(getTopology(),'registry','/sensapp/registry/composite/sensors/"+sensor.id+"'),'edit-Composite')")
					.text("Edit")
			)
			.append(' ')					
			.append(	
				//Remove Button
				$(document.createElement('a'))
					.attr("class","btn btn-danger")
					.attr("href","#delete-Sensor")
					.attr("data-toggle","modal")
					.attr("onclick","getDeleteInfos('"+sensor.id+"',this.parentNode.parentNode,'delete-Sensor','"+compositeDiv+"')")
					.html("<b style='font-size:16px'>&times;</b>")
			);	
}

//Used in Manage Content OnClick
function dispatchSensors (sensorId,compositeDiv,containedDiv,sensorDiv) {
		$('#'+containedDiv).find('h2').text("Sensors of "+sensorId);
		getCompositeInformations(getURL(getTopology(),'registry','/sensapp/registry/sensors'),sensorId,containedDiv,sensorDiv);

		$('#'+compositeDiv).hide();
		$('#'+sensorDiv).show();
		$('#'+containedDiv).show();
	}

//Called when adding a new Composite
function addRowToCompositeDatable(sensor,compositeDiv,containedDiv,sensorDiv) {
	$('#'+compositeDiv).find('table').dataTable().fnAddData( [
		createNameColumn(sensor.id,"composite").html(),
		createDescriptionColumn(sensor,"composite").html(),
		createCompositeActions(sensor,compositeDiv,sensorDiv).html()] );
}

function removeComposite(targetURL,row,compositeDiv) {
	
	$.ajax({
		type: "delete",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
			removeRow(row,$('#'+compositeDiv).find('table').attr('id'));
			alertMessage("success","Sensor deleted",5000);
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

//*********************************
// Edit Modal Functions
//**********************************


//*********************************
// Contained Table Functions
//**********************************

function addRowToContainedDataTable (sensor,containedDiv,sensorDiv) {
	$('#'+containedDiv).find('table').dataTable().fnAddData([
		createNameColumn(sensor.id,"sensor").html(),
		createDescriptionColumn(sensor,"sensor").html(),
		createContainedActions(sensor.id,containedDiv,sensorDiv).html()]);
}

function addRowToContainedDataTableById(targetURL,containedDiv,sensorDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
				addRowToContainedDataTable(data,containedDiv,sensorDiv);
				$('#'+containedDiv).find('table').dataTable().$("div[rel=popover]").popover({placement:'right'});			
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}


function createContainedActions(sensorId,containedDiv,sensorDiv) {
	return 	$(document.createElement('label'))
				.attr("class","checkbox")
				.append(
						$(document.createElement('a'))
						.attr("id",sensorId+"-Out")
						.attr("onclick","removeRow($(this).closest('tr').get(0),'"+$('#'+containedDiv).find('table').attr('id')+"');addRowToSensorDatatableById(getURL(getTopology(),'registry','/sensapp/registry/sensors/"+sensorId+"'),'"+containedDiv+"','"+sensorDiv+"');containedList.splice('/sensapp/registry/sensors/"+sensorId+"',1);")
						.attr("class","btn btn-danger")
						.html("<b style='font-size:16px'>&times;</b>")
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

function addRowToSensorDatatableById(targetURL,containedDiv,sensorDiv) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
			addRowToSensorDatatable(data,containedDiv,sensorDiv);
			$('#'+sensorDiv).find('table').dataTable().$("div[rel=popover]").popover({placement:'right'});				
		},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});

}

function addRowToSensorDatatable (sensor,containedDiv,sensorDiv) {

	$('#'+sensorDiv).find('table').dataTable().fnAddData( [
		createNameColumn(sensor.id,"sensor").html(),
		createDescriptionColumn(sensor,"sensor").html(),
		createSensorActions(sensor,containedDiv,sensorDiv).html()] );
}


function createSensorActions(sensor,containedDiv,sensorDiv) {

	return $(document.createElement('div'))
		.append(
			$(document.createElement('a'))
			.attr("class","btn btn-primary")
			.attr("onclick","removeRow($(this).closest('tr').get(0),'"+$('#'+sensorDiv).find('table').attr('id')+"');addRowToContainedDataTableById(getURL(getTopology(),'registry','/sensapp/registry/sensors/"+sensor.id+"'),'"+containedDiv+"','"+sensorDiv+"');containedList.push(getURL(getTopology(),'registry','/sensapp/registry/sensors/"+sensor.id+"'));")
			.text("Add")
		);
}

function putSensors(targetURL) {

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify({"sensors":containedList}),
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
		selectedList.push("/sensapp/registry/sensors/"+sensorId);
	}
	else {
		  selectedList = jQuery.grep(selectedList, function(value) {
		  return value != "/sensapp/registry/sensors/"+sensorId;
		});
	}
}

//*********************************
// Post Composite Modal Functions
//**********************************

function registerComposite(formDiv,compositeDiv,containedDiv,sensorDiv) {
		var postData = getCompositeToPost(formDiv);
		postComposite(getURL(getTopology(),"registry","/sensapp/registry/composite/sensors"),postData,compositeDiv,containedDiv,sensorDiv);
		clearAddModal(formDiv);
	}

function postComposite(targetURL,postData,compositeDiv,containedDiv,sensorDiv) {

	$.ajax({
		type: "post",
		url: targetURL,
		contentType: "application/json",
		data: JSON.stringify(postData),
		success: function (data,textStatus,jqXHR) {
			addRowToCompositeDatable(postData,compositeDiv,containedDiv,sensorDiv);
			$('#'+compositeDiv).find('table').dataTable().$("div[rel=popover]").popover({placement:'right'});
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
// Edit Modal functions
//**********************************

//fill the edit modal
function getEditInfos(targetURL,editModal) {

	$.ajax({
		type: "get",
		url: targetURL,
		success: 
			function (data, textStatus, jqXHR) {
				fillEditModal(data,editModal);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});	
}

function fillEditModal(data,editModal) {

	$('#'+editModal).find('#title').text(data.id);

	$('#'+editModal).find('#id').attr('value',data.id);
	if(typeof data.descr !='undefined'){
		$('#'+editModal).find('#descr').attr('value',data.descr);
	}
	
	if(typeof data.tags != 'undefined'){
		$.each(data.tags, function(i,element) {
			$('#'+editModal).find('tbody')
				.append(
					//New Row
					$(document.createElement('tr'))
						.attr('id',i+'TagRow')
						.append(
							//Labeø
							$(document.createElement('td'))
								.attr("style","font-weight:bold;")
								.attr('id',i+'ExistingTagField')
								.append(
									$(document.createElement('span'))
										.text(i))
								.append(" :"))
						.append(
							//Value
							$(document.createElement('td'))
								.attr('id',i+'TagValue')
								.append(
									$(document.createElement('input'))
										.attr("class","input-medium search-query")
										.attr("value",element))	
								.append(' ')
								.append(
									//Remove Button
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


function editComposite(modalDiv,tableDiv) {

	var targetURL = getURL(getTopology(),"registry","/sensapp/registry/composite/sensors/"+$('#'+modalDiv).find('#id').val());

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		data: JSON.stringify({"tags":getTags(modalDiv)}),
		success: 
			function (data, textStatus, jqXHR) {
				updateSensorDescr(targetURL,modalDiv,tableDiv);
				clearEditModal(modalDiv);
			},
		error: function (jqXHR, textStatus, errorThrown) {

				clearEditModal(modalDiv);
				alertMessage("error",errorThrown,5000);
			}
	});
}

function clearEditModal(modalDiv) {
	$('#'+modalDiv).find('#title').empty();
	$('#'+modalDiv).find('#descr').val("");	
	$('#'+modalDiv).find('tr[id$="TagRow"]').remove();
}

function updateSensorDescr (targetURL,modalDiv,tableDiv) {		 

	$.ajax({
		type: "put",
		url: targetURL,
		contentType: "application/json",
		dataType:'json',
		data: JSON.stringify(getDescr(modalDiv)),
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

	alert(tableDiv);
	colId = $('#'+tableDiv).find("th:contains('Description')").index();
	rowId = $('#'+tableDiv).find("tr").has("a[id="+data.id+"]").index();

	$('#'+tableDiv).find("tbody").find("tr").eq(rowId).find("td").eq(colId).html(createDescriptionColumn(data,"composite").html());
	$('#'+tableDiv).find('table').dataTable().$("div[rel=popover]").popover({placement:'right'});

}

//*********************************
// Delete Modal functions
//**********************************

//Fill delete Modal
function getDeleteInfos (sensorId,row,modalDiv,compositeDiv) {
	$('#'+modalDiv).find('h2').text("Delete " + sensorId + " ?");
	$('#'+modalDiv).find('#delete').unbind('click').click( function () {
		removeComposite(getURL(getTopology(),'registry','/sensapp/registry/composite/sensors/'+sensorId),row,compositeDiv)
	});
}


//*********************************
// Get JSON functions
//**********************************

function getTags(modalDiv) {

	var fields = new Array();
	var values = new Array();
	$.each($('#'+modalDiv).find('td[id$="ExistingTagField"]').find('span'),function(i,element) {
		fields.push($(element).text());
		values.push($(this).closest('td').next('td').find('input').val());
	});
	$.each($('#'+modalDiv).find('td[id$="NonExistingTagField"]').find('input[value!=""]'),function(i,element) {
		fields.push($(element).val());
		values.push($(this).closest('td').next('td').find('input').val());
	});
	var jsonString = '{'
	if(fields.length!=0) {
		jsonString += '"'+fields[0]+'":"'+values[0]+'"';
		for(var i=1;i<fields.length && i<values.length;i++) {
			jsonString += ',"'+fields[i]+'":"'+values[i]+'"';
		}
	}
	jsonString += "}";

	return eval('(' + jsonString + ')');
}

function getDescr(modalDiv) {
	return {"descr":$('#'+modalDiv).find("#descr").val()};
}

function getCompositeToPost(div) {

	return 	{ "id": $('#'+div).find('#id').attr('value'),
	"descr" : $('#'+div).find('#descr').attr('value'),
	"tags" : getTags(div),
	"sensors":[]
	};
}