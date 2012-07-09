function addVisualisation(formDiv,visuDiv,sensorDiv) {
	addVisualisationToDataTable($('#'+formDiv).find('#id').val(),$('#'+formDiv).find('#type').val(),visuDiv,sensorDiv);
}

function clearVisualisationModal(div) {
	$('#'+div).find('#id').attr("value","");
	$('#'+div).find('#type').val("table");
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
			setMutltipleSelection(visuName,visuDiv,sensorDiv);
			break;
		case "chart":
			setMutltipleSelection(visuName,visuDiv,sensorDiv);
			break;
		default:
			break;
	}
}

//currently useless, but can be used
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
		var visuRowId = $('#'+visuDiv).find("tr").has("span[id="+visuName+"]").index();

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
		$('#'+sensorDiv).find('table').dataTable().$('.row_selected').toggleClass('row_selected');
	});
}
//Displays  sensor Table
function getAllSensors (sensorDiv) {

	$.ajax({
		type: "get",
		url: getURL(getTopology(),"registry","/sensapp/registry/sensors?flatten=true"),
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


function generate(visuDiv,displayDiv) {

	$('#'+visuDiv).hide();
	$('#'+displayDiv).empty();
		var nameColId = $('#'+visuDiv).find('table').find("th:contains('Name')").index();
		var typeColId = $('#'+visuDiv).find('table').find("th:contains('Type')").index();
		var sensorsColId = $('#'+visuDiv).find('table').find("th:contains('Sensors')").index();

		$.each($('#'+visuDiv).find('table tbody tr'), function (i,row) {
			var visuName = $(row).find('td').eq(nameColId).text();
			var visuType = $(row).find('td').eq(typeColId).text();
			var sensors = new Array();	
	
			switch (visuType) {
				case "table":
					$.each($(row).find('td').eq(sensorsColId).find('div'),function(i,div) {
						sensors.push(div.innerHTML);
					});
					generateTable(visuName,sensors,displayDiv);
					break;
				case "chart":
					$.each($(row).find('td').eq(sensorsColId).find('div'),function(i,div) {
						sensors.push(div.innerHTML);
					});
					generateChart(visuName,sensors,displayDiv);
					break;
				default:
					break;
			}
		});
}


function generateTable (visuName,sensors,displayDiv) {

	var sensorCounter = 0
	
	$.each(sensors,function (i,sensor) {
		$.ajax({
			type: "get",
			url: getURL(getTopology(),"registry","/sensapp/registry/sensors/"+sensor),
			contentType: "application/json",
			dataType:'json',
			success: 
				function (sensorsInfos, textStatus, jqXHR) {
					getSensorTableData(visuName,sensorsInfos,displayDiv);
				},
			error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
		});	
	});
	
	function getSensorTableData (visuName,sensorsInfos,displayDiv) {

		var senMLArray = [];
	
		$.ajax({
			type: "get",
			url: sensorsInfos.backend.dataset,
			contentType: "application/json",
			dataType:'json',
			success: 
				function (data, textStatus, jqXHR) {
					sensorCounter++;
					senMLArray.push(data);
					if (sensorCounter==sensors.length) {
						createTable(senMLArray,visuName,displayDiv);
					}
				},
			error: 
				function (jqXHR, textStatus, errorThrown) {
					alertMessage("error",errorThrown,5000);
				}
		});	
	}
	
	function createTable(senMLArray,visuName,displayDiv) {

		var dataArray = [];
		var titles = [{"sTitle":"Time"}];
		var headers = $(document.createElement('tr')).append($(document.createElement('th')).text("Time"));
	
		$.each(senMLArray,function(i,senML) {
			titles.push({"sTitle":senML.bn});
			headers.append($(document.createElement('th')).text(senML.bn));
			alert(JSON.stringify(dataArray));
				$.each(senML.e, function(j,element) {
					if(typeof dataArray[(senML.t+senML.bt)+""]=="undefined") {
						dataArray[(element.t+senML.bt)+""]=[];
						dataArray[(element.t+senML.bt)+""][0]=element.t+senML.bt;
						for(var j=1;j<i+1;j++) {					
							dataArray[(element.t+senML.bt)+""][j]="-";
						}
						dataArray[(element.t+senML.bt)+""][i+1]=element.v;
						for(var j=i+2;j<senMLArray.length+1;j++) {					
							dataArray[(element.t+senML.bt)+""][j]="-";
						}
					}
					else {
						dataArray[(element.t+senML.bt)+""][i+1]=element.v;
					}				
				});
		});
		var dataTablesArray = [];
		alert("hey1");
		$.each(dataArray,function(i,row) {
	//	alert("hey2");
			dataTablesArray.push(row);
		});
		alert("hey3");
		var newTable = 
			$(document.createElement('table'))
				.attr("id",visuName+"Data")
				.attr("class","table table-striped table-bordered")
				.attr("cellpadding","0")
				.attr("cellspacing","0")
				.attr("border","0")
				.append(
					$(document.createElement('thead'))
						.append(headers))
				.append(
					$(document.createElement('tbody')));
		$('#'+displayDiv).append($(document.createElement('div')).append(newTable));
		tableToJqueryDataTable (dataTablesArray,titles,visuName+"Data");		
	}
}

function generateChart(visuName,sensors,displayDiv) {

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

	function drawChart(visuName,seriesArray,displayDiv) {
	
		var newChart = document.createElement('div');
		$('#'+displayDiv).append(newChart);

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
