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
}

function fillSelect(sensor,selectList) {
	$('#'+selectList).append(
		$(document.createElement("option"))
			.attr("id",sensor.id)
			.text(sensor.id)
	);
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
				//Remove Button
				$(document.createElement('a'))
					.attr("class","btn")
					.attr("href","#")
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

function createContainedTable (targetURL,sensorId,containedDiv) {


	$.ajax({
		type: "get",
		url: targetURL,
		success: function (data,textStatus,jqXHR) {
				containedTable = $('#'+containedDiv).find('table')[0];
				$(containedTable).dataTable().fnClearTable();
				/*containedTable.dataTable().fnDestroy();*/
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

} 

function displayContainedSensors(data,containedDiv) {

	$.each(data.sensors, function (i,element) {
		var split = element.split("/registry/composite/sensors/");
		addRowToContainedDataTable(split[split.length-1],containedDiv);
	});
}

function addRowToContainedDataTable (element,containedDiv) {

	containedDiv.find('table').dataTable().fnAddData([
		element,
		createContainedSelection().html()]);
}

function createContainedSelection() {

	return 	$(document.createElement('label'))
				.attr("class","checkbox")
				.append(
						$(document.createElement('input'))
						.attr("type","checkbox")
						//.attr("onclick","putToComposite(getURL(topology,'registry','/registry/sensors/"+sensor.id+"'))")
						.attr("class","checkbox")
						
				);

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
			$(document.createElement('script')).append("$(function() {$('#"+sensor.id+"-Infos').popover({placement:'top'});});")
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
		);
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