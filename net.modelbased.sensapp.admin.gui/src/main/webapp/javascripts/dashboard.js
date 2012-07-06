function addVisualisation(formDiv,visuDiv,sensorDiv) {
	addVisualisationToDataTable($('#'+formDiv).find('#id').val(),$('#'+formDiv).find('#type').val(),visuDiv,sensorDiv);
}

function addVisualisationToDataTable(visu,type,visuDiv,sensorDiv) {

	nameDiv = $(document.createElement('div')).append(
		$(document.createElement('span'))
			.attr("id",visu)
			.text(visu)
	);

	$('#'+visuDiv).find('table').dataTable().fnAddData( [
		nameDiv.html(),
		type,
		"",
		createVisualisationActions(visu,type,visuDiv,sensorDiv).html()] );
}

function createVisualisationActions(visu,type,visuDiv,sensorDiv) {

	return  $(document.createElement('div'))
				.append(
					$(document.createElement('button'))
						.attr("class","btn")
						.text("Choose Sensors")
						.attr("onclick","showSensors('"+visu+"','"+type+"','"+visuDiv+"','"+sensorDiv+"')")
				)
				.append(
					$(document.createElement('button'))
						.attr("href","#delete-Visu")
						.attr("data-toggle","modal")
						.attr("onclick","getDeleteInfos('"+visu+"',this.parentNode.parentNode,'delete-Visu')")
						.attr("class","btn btn-danger")
						.html("<b style='font-size:16px'>&times;</b>")
				);	
}

function getDeleteInfos(visu,row,deleteModal) {

	$('#'+deleteModal).find("h2").text("Delete "+ visu +" ?");

	$('#'+deleteModal).find('#deleteVisu').unbind('click').click( function () {
		var oTable = $(row).closest('table').dataTable();
		oTable.fnDeleteRow(oTable.fnGetPosition(row));
	});

}

function showSensors(visuName,type,visuDiv,sensorDiv) {
	$('#'+visuDiv).hide();
	$('#'+sensorDiv).show();
	switch (type) {
		case "table":
			setRadioSelection(visuName,visuDiv,sensorDiv);
			break;
		case "chart":
			setMutltipleSelection(visuName,visuDiv,sensorDiv);
			break;
		default:
			break;
	}
}

function setRadioSelection(visuName,visuDiv,sensorDiv) {
	
	var oTable=$('#'+sensorDiv).find('table').dataTable();
	//make radio selectable
	$('#'+sensorDiv).find("table tbody").die().unbind('click').click(function(event) {
			$(oTable.fnSettings().aoData).each(function (){
				$(this.nTr).removeClass('row_selected');
			});
			$(event.target.parentNode).addClass('row_selected');
			var sensorColId = $(this.parentNode).find("th:contains('Name')").index();
			aSelected = [$(event.target.parentNode).find('td').eq(sensorColId).text()];
		});
		
	//set Register Function
	$('#'+sensorDiv).find('#register').unbind('click').click(function () {
		if(aSelected.length>0) {
			var sensorListColId = $('#'+visuDiv).find("th:contains('Sensors')").index();
			var visuRowId = $('#'+visuDiv).find("tr td").find("#"+visuName).index();

			$('#'+visuDiv).find("tbody").find('tr').eq(visuRowId).find('td').eq(sensorListColId).html("<div>"+aSelected[0]+"</div>");			
		}
		$('#'+visuDiv).show();
		$('#'+sensorDiv).hide();
	});
}


function setMutltipleSelection(visuName,visuDiv,sensorDiv) {

	var oTable=$('#'+sensorDiv).find("table").dataTable();
	//make check selectable

    /* Click event handler */	
	$('#'+sensorDiv).find('table tbody').unbind('click');
    $('#'+sensorDiv).find('table tbody tr').die().live('click', function () {
		var sensorColId = $('#'+sensorDiv).find("th:contains('Name')").index();
        var sensorName = $(this).find('td').eq(sensorColId).text();
        var index = jQuery.inArray(sensorName, aSelected);
         
        if ( index === -1 ) {
            aSelected.push( sensorName );
        } else {
            aSelected.splice( index, 1 );
        }
         
        $(this).toggleClass('row_selected');
    });
	
	//set Register Function
	$('#'+sensorDiv).find('#register').unbind('click').click(function () {
		var sensorListColId = $('#'+visuDiv).find("th:contains('Sensors')").index();
		var visuRowId = $('#'+visuDiv).find("tr").has("td:contains('"+visuName+"')").index();

		$('#'+visuDiv).find("tbody").find('tr').eq(visuRowId).find('td').eq(sensorListColId).empty();
		if($('#'+sensorDiv).find('tr.row_selected').size()>0) {
			$.each(aSelected,function(i,sensor) {
				$('#'+visuDiv).find("tbody").find('tr').eq(visuRowId).find('td').eq(sensorListColId).append("<div>"+sensor+"</div>");
			});
		}
		$('#'+sensorDiv).find('table tbody tr').die();
		$('#'+visuDiv).show();
		$('#'+sensorDiv).hide();
		aSelected=[];
	});
}

//Displays a sensor Table with radio selection (for Table visu)
function getAllSensors (sensorDiv) {

	$.ajax({
		type: "get",
		url: getURL(getTopology(),"registry","/registry/sensors?flatten=true"),
		contentType: "application/json",
		dataType:'json',
		success: 
			function (data, textStatus, jqXHR) {
				var sensorColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Creation Date"}];
				tableToJqueryDataTable ([],sensorColumns,$('#'+sensorDiv).find("table").attr('id'));
				if (data.length!=0) {
					var sensorArray = new Array();
					$.each(data,function (i,sensor) {
						sensorArray.push([sensor.id,
										  createDescriptionColumn(sensor,"sensor").html(),
										  timeStampToDate(sensor.creation_date),
										  ]);
					});
					$('#'+sensorDiv).find("table").dataTable().fnAddData(sensorArray);
				}
			},
	error: 
		function (jqXHR, textStatus, errorThrown) {
			alertMessage("error",errorThrown,5000);
		}
	});
}


function generate(visuDiv) {

	if(initDashboard!='undefined') {
		var nameColId = $('#'+visuDiv).find('table').find("th:contains('Name')").index();
		var typeColId = $('#'+visuDiv).find('table').find("th:contains('Type')").index();
		var sensorsColId = $('#'+visuDiv).find('table').find("th:contains('Sensors')").index();
		var tmpDashboard=new Array();	

		$.each($('#'+visuDiv).find('table tbody tr'), function (i,row) {
			var visuName = $(row).find('td').eq(nameColId).text();
			var visuType = $(row).find('td').eq(typeColId).text();
			tmpDashboard.push({"visualisation":visuName,"type":visuType,sensors:[]});
			
			switch (visuType) {
				case "table":
					tmpDashboard[i].sensors = $(row).find('td').eq(sensorsColId).find('div')[0].innerHTML;
					generateTable(visuName,$(row).find('td').eq(sensorsColId).find('div')[0].innerHTML);
					break;
				case "chart":
					var sensors = new Array();
					$.each($(row).find('td').eq(sensorsColId).find('div'),function(i,div) {
						sensors.push(div.innerHTML);
					});
					tmpDashboard[i].sensors = sensors;
					generateChart(visuName,sensors);
					break;
				default:
					break;
			}

		});
	}
	else {
		$.each(initDashboard, function (i,visualisation) {
				var visuName = visualisation.name
				var visuType = visualisation.type
				switch (visuType) {
					case "table":
						generateTable(visuName,visualisation.sensors);
						break;
					case "chart":
						generateChart(visuName,visualisation.sensors);
						break;
					default:
						break;
				}
			});
	}
}

function generateTable (visuName,sensor) {
	$.ajax({
		type: "get",
		url: getURL(getTopology(),"registry","/registry/sensors/"+sensor),
		contentType: "application/json",
		dataType:'json',
		success: 
			function (sensorsInfos, textStatus, jqXHR) {
				getSensorTableData(visuName,sensorsInfos);
			},
		error: 
		function (jqXHR, textStatus, errorThrown) {
			alertMessage("error",errorThrown,5000);
		}
	});	
}

function getSensorTableData (visuName,sensorsInfos) {

	$.ajax({
		type: "get",
		url: getURL(getTopology(),"database."+sensorsInfos.backend.kind,sensorsInfos.backend.dataset),
		contentType: "application/json",
		dataType:'json',
		success: 
			function (data, textStatus, jqXHR) {
				var dataColumns = [{"sTitle":"Time"},{"sTitle":"Value"}];
				//create the table
				var newTable = 
				$(document.createElement('table'))
					.attr("id",visuName)
					.attr("class","table table-striped table-bordered")
					.attr("cellpadding","0")
					.attr("cellspacing","0")
					.attr("border","0")
					.append(
						$(document.createElement('thead'))
							.append(
								$(document.createElement('tr'))
									.append(
										$(document.createElement('th'))
											.text("Time"))
									.append(
										$(document.createElement('th'))
											.text("Value")))
					.append(
						$(document.createElement('tbody')))
				);
				$('#display').append($(document.createElement('div')).append(newTable));
				tableToJqueryDataTable (getDataArray(data),dataColumns,visuName);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});	
}

function generateChart(visuName,sensors) {

	var seriesCounter = 0;
	var seriesArray = [];
	var numberOfSensors = sensors.length;
	
	$.each(sensors,function (i,sensor) {
		generateLine(visuName,sensor);
	});		
	
	function generateLine(visuName,sensor) {
		$.ajax({
			type: "get",
			url: getURL(getTopology(),"registry","/sensapp/registry/sensors/"+sensor),
			contentType: "application/json",
			dataType:'json',
			success: 
				function (sensorsInfos, textStatus, jqXHR) {
					getSensorChartData(visuName,sensorsInfos);
				},
			error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
		});	
	}

	function getSensorChartData(visuName,sensorsInfos) {
		
		$.ajax({
			type: "get",
			url: getURL(getTopology(),"database."+sensorsInfos.backend.kind,sensorsInfos.backend.dataset+"?sorted=asc"),
			contentType: "application/json",
			dataType:'json',
			success: 
				function (SenMLData, textStatus, jqXHR) {
					seriesCounter++;
					if(typeof SenMLData.e[0].s!='undefined') {
						graphType='area';
					}
					else {
						graphType='line';
					}

					seriesArray.push({	name:SenMLData.bn,
										data:SenMLToHighcharts(SenMLData),
										step:(typeof SenMLData.e[0].bv!='undefined'),
										type:graphType
									});
					if(seriesCounter==numberOfSensors) {
						drawChart(visuName,seriesArray);
					}
				},
			error: 
				function (jqXHR, textStatus, errorThrown) {
					alertMessage("error",errorThrown,5000);
				}
		});	
	}		

	function drawChart(visuName,seriesArray) {
	
		var newChart = document.createElement('div');
		$('#display').append(newChart);

			rawChart = new Highcharts.StockChart({
				chart: {
					renderTo: newChart
				},
				title: {
					text:visuName
				},
				xAxis: {
					ordinal:false
				},
				series: seriesArray
			});	
	}
}

function getDataArray(data) {

	var dataArray = new Array();
	//Check out the kind of data
	if(typeof data.e!='undefined') {
		if(typeof data.e[0].v!='undefined') {
			if(typeof data.bt=='undefined') {
				$.each(data.e, function (i,element) {
					dataArray.push( [timeStampToDate(element.t),element.v + " " + element.u] );
				});
			}
			else {
				$.each(data.e, function (i,element) {
					dataArray.push( [timeStampToDate(element.t+data.bt),element.v + " " + element.u] );
				});
			}
		} else { 
			if (typeof data.e[0].sv!='undefined') {
				if(typeof data.bt=='undefined') {
					$.each(data.e, function (i,element) {
						dataArray.push( [timeStampToDate(element.t),element.sv + " " + element.u] );
					});
				}
				else {
					$.each(data.e, function (i,element) {
						dataArray.push( [timeStampToDate(element.t+data.bt),element.sv + " " + element.u] );
					});
				}
			} else { 
				if (typeof data.e[0].bv!='undefined') {
					if(typeof data.bt=='undefined') {
						$.each(data.e, function (i,element) {
							dataArray.push( [timeStampToDate(element.t),element.bv] );
						});
					}
					else {
						$.each(data.e, function (i,element) {
							dataArray.push( [timeStampToDate(element.t+data.bt),element.bv] );
						});
					}
				} else {
					if (typeof data.e[0].s!='undefined') {
						if(typeof data.bt=='undefined') {
							$.each(data.e, function (i,element) {
								dataArray.push( [timeStampToDate(element.t),element.bv] );
							});
						}
						else {
							$.each(data.e, function (i,element) {
								dataArray.push([timeStampToDate(element.t+data.bt),element.bv]);
							});
						}
					}
				}
			}
		}
	}
	return dataArray;
}
