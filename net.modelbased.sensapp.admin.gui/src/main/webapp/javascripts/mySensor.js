//*********************************
// ADMIN FUNCTIONS
//*********************************
	function getMySensor (targetURL,div,navBarId) {
		$.ajax({
			type: "get",
			url: targetURL,
			contentType: "application/json",
			dataType:'json',
			success: 
				function (sensor, textStatus, jqXHR) {
						displayMySensor(sensor,div);
						initButtons(sensor,div,navBarId);
				},
			error: 
				function (jqXHR, textStatus, errorThrown) {
					alertMessage("error",errorThrown,5000);
				}
		});
	}

	function displayMySensor (sensor,div) {

		$('#'+div).find('h2').text(sensor.id);

		$('#'+div).find('#admin').find('tbody').find('tr')
			.append(
				$(document.createElement('td')).append(createNameColumn(sensor.id)))
			.append(
				$(document.createElement('td')).append(createDescriptionColumn(sensor)))
			.append(
				$(document.createElement('td')).text(timeStampToDate(sensor.creation_date)))
			.append(
				$(document.createElement('td')).append(createSensorActions(sensor)));
		
		$("div[rel=popover]").popover({placement:'right'})			
		
	}

	function createSensorActions(sensor) {

		return $(document.createElement('div'))
			.append(
				//Edit Button
				$(document.createElement('a'))
					.attr("href","#edit-Sensor")
					.attr("onclick","getMoreInputInfos(getURL(getTopology(),'registry','/sensapp/registry/sensors/"+sensor.id+"'),'edit-Sensor')")
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
					.attr("onclick","getDeleteInfos('"+sensor.id+"',this.parentNode.parentNode,'delete-Sensor')")
					.attr("class","btn btn-danger")
					.html("<b style='font-size:16px'>&times;</b>")
			);
	}
function initButtons(sensor,div,navBarId){
	//AdminButton
	$('#'+navBarId).find('#admin').click(function () {
		$('#'+div).find('#admin').show();
		$('#'+div).find('#datatable').hide();
		$('#'+div).find('#chart').hide();
		$(this).closest('ul').find('li').removeClass('active');
		$(this).closest('li').attr('class','active');

	});
	//Datatable display
	$('#'+navBarId).find('#datatable').click(function () {
		$('#'+div).find('#admin').hide();
		$('#'+div).find('#datatable').show();
		$('#'+div).find('#chart').hide();
		$(this).closest('ul').find('li').removeClass('active');
		$(this).closest('li').attr('class','active');
		if(jsonRawData.length==0) {
			getData(getURL(getTopology(),'database.'+sensor.backend.kind,sensor.backend.dataset),sensor.id,sensor.backend.kind,div,"table");
		}
		else {
			displayRawData(div,jsonRawData[0]);
		}
	});
	//Chart display
	$('#'+navBarId).find('#chart').click(function () {
		$('#'+div).find('#admin').hide();
		$('#'+div).find('#datatable').hide();
		$('#'+div).find('#chart').show();
		$(this).closest('ul').find('li').removeClass('active');
		$(this).closest('li').attr('class','active');
		if(jsonRawData.length==0) {
			getData(getURL(getTopology(),'database.'+sensor.backend.kind,sensor.backend.dataset),sensor.id,sensor.backend.kind,div,"chart");
		}
		else {
			displayRawTimeSerie(div,jsonRawData[0]);
		}
	});
}
	//*********************************
	// Edit Modal Functions
	//**********************************

	//Init Modal
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

	 function fillInputValues(data,div) {

		//title
		$('#'+div).find('#title').append(data.id);

		//fields
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
		
		//tags
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
	
	//called when updating a sensor
	function updateSensor(id,formDiv,tableDiv) {
		$.ajax({
			type: "put",
			url: getURL(getTopology(),"registry","/sensapp/registry/sensors/"+id),
			contentType: "application/json",
			dataType:'json',
			data: JSON.stringify(getSensorInfosToPut(formDiv)),
			success: 
				function (data, textStatus, jqXHR) {
					//udpate description too
					updateSensorDescr(getURL(getTopology(),"registry","/sensapp/registry/sensors/"+id),getJSONDescr(formDiv),tableDiv);
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
		$("div[rel=popover]").popover({placement:'right'})		

	}

	//Called When leaving the modal
	function clearEditModal(div) {
		$('#'+div).find('#title').empty();
		$('#'+div).find('tr[id$="TagRow"]').remove();
		$('#'+div).find('#descr').attr("value","");
		$('#'+div).find('#update_time').attr("value","");
		$('#'+div).find('#longitude').attr("value","");
		$('#'+div).find('#latitude').attr("value","");
	}

	//*********************************
	// Delete Modal Functions
	//**********************************

	//Init Modal
	function getDeleteInfos(sensorId,row,modalDiv) {
		$('#'+modalDiv).find('h2').text("Delete " + sensorId + " ?");
		$('#'+modalDiv).find('#delete').unbind('click').click( function () {
			deleteSensor(getURL(getTopology(),'registry','/sensapp/registry/sensors/'+sensorId),row);
		});
	}

	function deleteSensor(targetURL,row) {

		$.ajax({
			type: "delete",
			url: targetURL,
			success: 
				function (data, textStatus, jqXHR) {
					$(row).remove();
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

//*********************************
// VISUALISATION FUNCTIONS
//*********************************	

function getData(targetURL,sensorName,dataType,div,displayType) {

	//Please Wait
	$('body').css('cursor','wait');
	$('a').css('cursor','wait');
	$('button').css('cursor','wait');
	
	
	query="?";
	query+="limit=20000&";
	query+="sorted=asc";

	//Get data
	$.ajax({
		type: "get",
		url: targetURL+query,
		headers: { 
			Accept : "application/json"
		},
		dataType: 'json',
		success:
			function (data, textStatus, jqXHR) {
				jsonRawData.push(data);
				switch (dataType) {
					case "raw":
						switch (displayType) {
							case "table":
								displayRawData(div,data);
								break;
							case "chart":
								displayRawTimeSerie(div,data);
								break;
							default:
								break;
						}
						break;
					default:
						break;
				}
				$('body').css('cursor','auto');
				$('a').css('cursor','pointer');
				$('button').css('cursor','pointer');
			},
		error:
			function (jqXHR, textStatus, errorThrown) {
				$('body').css('cursor','auto');
				$('a').css('cursor','pointer');
				$('button').css('cursor','pointer');
				alertMessage("error",errorThrown,5000);
			}
	});
}

//Table View
function displayRawData(div,data) {

	if($('#'+div).find('#datatable').find('.dataTables_empty').size()>0) {
		var dataArray = new Array();
		//Check out the kind of data		
		if(typeof data.e!='undefined') {
			if(typeof data.bt=='undefined') {
				data.bt = 0;
			}
			if(typeof data.e[0].v!='undefined') {
				$.each(data.e, function (i,element) {
					dataArray.push( [timeStampToDate(element.t),element.v + " " + element.u] );
				});
			} else { 
				if (typeof data.e[0].sv!='undefined') {
					$.each(data.e, function (i,element) {
						dataArray.push( [timeStampToDate(element.t+data.bt),element.sv + " " + element.u] );
					});
				} else { 
					if (typeof data.e[0].bv!='undefined') {
						$.each(data.e, function (i,element) {
							dataArray.push( [timeStampToDate(element.t+data.bt),element.bv] );
						});
					} else {
						if (typeof data.e[0].s!='undefined') {
							$.each(data.e, function (i,element) {
								dataArray.push([timeStampToDate(element.t+data.bt),element.bv]);
							});
						}
					}
				}
			}
			$('#'+div).find('#datatable').find('table').dataTable().fnAddData(dataArray);
		}
	}
}

//Static graph View
function displayRawTimeSerie(div,data) {

	if(typeof data.e!='undefined') {
		if($('#'+div).find('#chart').children().size()==0){
		
			if(typeof data.e[0].s!='undefined') {
				graphType='area';
			}
			else {
				graphType='line';
			}
		
			$(document).ready(function() {
				rawChart = new Highcharts.StockChart({
					chart: {
						renderTo: $('#'+div).find('#chart')[0],
					},
					title: {
						text: data.bn
					},
					xAxis: {
						ordinal:false
					},
					series: [{
						name: data.bn,
						data: SenMLToHighcharts(data),
						type: graphType,
						step: (typeof data.e[0].bv!='undefined')
					}]
				});
			});
		}
	}
}
