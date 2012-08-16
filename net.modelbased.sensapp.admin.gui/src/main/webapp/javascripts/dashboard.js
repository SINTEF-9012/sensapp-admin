//restore previous visu
function initVisualisation(visuDiv) {
	var visuArray=[];
	
	if(localStorage.getItem("visualisations")!=null) {
		var body = $(document.createElement('tbody'))
		body.html(localStorage.getItem("visualisations"));
		$.each(body.children('tr'),function (i,row) {
			visuArray[i]=[];
			$.each($(row).children('td'),function (j,cell) {
				visuArray[i].push($(cell).html());
			});
		});
	}
	tableToJqueryDataTable(visuArray,[{"sTitle":"Name"},{"sTitle":"Type"},{"sTitle":"Sensors"},{"sTitle":"Actions"}],$('#'+visuDiv).find('table').attr('id'),'asc');
}

//add new visualistion
function addVisualisation(formDiv,visuDiv,sensorDiv) {
	var newVisu = $('#'+formDiv).find('#id').val();
	//test if correct name
	if(newVisu.indexOf(' ')==-1 && $("#"+visuDiv).find('#'+newVisu).size()==0) {
		addVisualisationToDataTable($('#'+formDiv).find('#id').val(),$('#'+formDiv).find('#type').val(),visuDiv,sensorDiv);
	}
	else {
		alertMessage("error","Invalid name",5000);
	}
}

//clear modal
function clearVisualisationModal(div) {
	$('#'+div).find('#id').attr("value","");
	$('#'+div).find('#type').val("table");
}

//add to datatable
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
		
	//store
	localStorage.setItem("visualisations",$('#'+visuDiv).find('table').find('tbody').html());
}

function createVisualisationActions(visu,type,visuDiv,sensorDiv) {

	return  $(document.createElement('div'))
				.append(
					//choose the sensors
					$(document.createElement('button'))
						.attr("class","btn")
						.text("Choose Sensors")
						.attr("onclick","showSensors('"+visu+"','"+type+"','"+visuDiv+"','"+sensorDiv+"')")
				)
				.append(
					//delete
					$(document.createElement('button'))
						.attr("href","#delete-Visu")
						.attr("data-toggle","modal")
						.attr("onclick","getDeleteInfos('"+visu+"',this.parentNode.parentNode,'delete-Visu')")
						.attr("class","btn btn-danger")
						.html("<b style='font-size:16px'>&times;</b>")
				);
						
}

//called when clicking on delete button
function getDeleteInfos(visu,row,deleteModal) {

	$('#'+deleteModal).find("h2").text("Delete "+ visu +" ?");

	$('#'+deleteModal).find('#deleteVisu').unbind('click').click( function () {
		var oTable = $(row).closest('table').dataTable();
		oTable.fnDeleteRow(oTable.fnGetPosition(row));
		//store
		localStorage.setItem("visualisations",$(row).closest('tbody').html());
	});

}

//called when clicking on Choose Sensors button
function showSensors(visuName,type,visuDiv,sensorDiv) {
	$('#'+visuDiv).hide();
	$('#'+sensorDiv).show();
	switch (type) {
		case "table":
			setMultipleSelection(visuName,visuDiv,sensorDiv);
			break;
		case "chart":
			setMultipleSelection(visuName,visuDiv,sensorDiv);
			break;
		case "map":
			setMultipleSelection(visuName,visuDiv,sensorDiv);
			break;
		default:
			break;
	}
}

function setMultipleSelection(visuName,visuDiv,sensorDiv) {

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
		//store
		localStorage.setItem("visualisations",$('#'+visuDiv).find('table').find('tbody').html());	
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
				//fill table
				var sensorColumns = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Creation Date"}];
				tableToJqueryDataTable ([],sensorColumns,$('#'+sensorDiv).find("table").attr('id'),'asc');
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

//************
// GENERATION
//*************

//Create the visualisations
function generate(visuDiv,displayDiv) {

	$('#'+visuDiv).hide();
	$('#'+displayDiv).show();
	
	var nameColId = $('#'+visuDiv).find('table').find("th:contains('Name')").index();
	var typeColId = $('#'+visuDiv).find('table').find("th:contains('Type')").index();
	var sensorsColId = $('#'+visuDiv).find('table').find("th:contains('Sensors')").index();

	//for each visualisation
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
			case "map":
				$.each($(row).find('td').eq(sensorsColId).find('div'),function(i,div) {
					sensors.push(div.innerHTML);
				});
				generateMap(visuName,sensors,displayDiv);
			default:
				break;
		}
	});
}

//Used when exporting JavaScript
function generateFromJson(jsonVisu,displayDiv) {

	var sensors = [];

	//for each visualisation
	$.each(jsonVisu, function (i,visu) {
		switch (visu.type) {
			case "table":
				$.each(visu.sensors,function(i,sensor) {
					sensors.push(sensor);
				});
				generateTable(visu.name,sensors,displayDiv);
				break;
			case "chart":
				$.each(visu.sensors,function(i,sensor) {
					sensors.push(sensor);
				});
				generateChart(visu.name,sensors,displayDiv);
				break;
			case "map":
				$.each(visu.sensors,function(i,sensor) {
					sensors.push(sensor);
				});
				generateMap(visu.name,sensors,displayDiv);
			default:
				break;
		}
	});
}

//****
//TABLE
//****
//create a table
function generateTable (visuName,sensors,displayDiv) {

	var sensorCounter = 0
	var senMLArray = [];
	$('#'+displayDiv).show();
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
	
	//get the data
	function getSensorTableData (visuName,sensorsInfos,displayDiv) {
	
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
	
	//actually creates table
	function createTable(senMLArray,visuName,displayDiv) {

		var dataArray = {};
		var titles = [{"sTitle":"Time"}];
		var headers = $(document.createElement('tr')).append($(document.createElement('th')).text("Time"));

		$.each(senMLArray,function(currentSensor,senML) {
			titles.push({"sTitle":senML.bn});
			headers.append($(document.createElement('th')).text(senML.bn));
			if(typeof senML.e!='undefined') {
				//Check Base Time
				if(typeof senML.bt=='undefined') {
					senML.bt=0;
				}
				if (typeof senML.e[0].u != 'undefined') {
					headers.find('th:last').append(" ("+ senML.e[0].u +")");
				}
				//Get the associative array of data
				dataArray=getDataArray(dataArray,senML,currentSensor,senMLArray.length);
			}
		});
		//Transform into dataTables Array
		var dataTablesArray = [];
		$.each(dataArray,function(i,row) {
			dataTablesArray.push(row);
		});
		
		//Create Table in DOM
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
					$(document.createElement('tbody'))
				);
		$('#'+displayDiv).find('#data').append($(document.createElement('div')).append(newTable));
		tableToJqueryDataTable (dataTablesArray,titles,visuName+"Data",'desc');		
	}
}
//*******
//CHART
//*******
//create a chart
function generateChart(visuName,sensors,displayDiv) {

	var seriesCounter = 0;
	var seriesArray = [];
	var numberOfSensors = sensors.length;
	
	//create each line
	$.each(sensors,function (i,sensor) {
		generateLine(visuName,sensor,displayDiv);
	});		
	
	//create a line
	function generateLine(visuName,sensor,displayDiv) {
		//get the sensor
		$.ajax({
			type: "get",
			url: getURL(getTopology(),"registry","/sensapp/registry/sensors/"+sensor),
			contentType: "application/json",
			dataType:'json',
			success: 
				function (sensorsInfos, textStatus, jqXHR) {
					//get the data
					getSensorChartData(visuName,sensorsInfos,displayDiv);
				},
			error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
		});	
	}

	//get the sensor data
	function getSensorChartData(visuName,sensorsInfos,displayDiv) {
		
		$.ajax({
			type: "get",
			url: sensorsInfos.backend.dataset+"?sorted=asc",
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
					//put data in array
					seriesArray.push({	name:SenMLData.bn,
										data:SenMLToHighcharts(SenMLData),
										step:(typeof SenMLData.e[0].bv!='undefined'),
										type:graphType
									});
					//if we have all the data
					if(seriesCounter==numberOfSensors) {
						//draw the chart
						drawChart(visuName,seriesArray,displayDiv);
					}
				},
			error: 
				function (jqXHR, textStatus, errorThrown) {
					alertMessage("error",errorThrown,5000);
				}
		});	
	}		

	//draw the chart
	function drawChart(visuName,seriesArray,displayDiv) {
	
		var newChart = document.createElement('div');
		$('#'+displayDiv).find('#data').append(newChart);
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

//*****
//MAP
//******
function generateMap(visuName,sensors,displayDiv) {

	var senMLArray = new Array();
	var sensorCounter = 0;
	
	//Test if there only is 2 sensors
	if(sensors.length!=2) {
		alertMessage("error","Map must have exactly 2 sensors",5000);
	}
	else {
		//get the sensors
		$.each(sensors,function (i,sensor) {
			$.ajax({
				type: "get",
				url: getURL(getTopology(),"registry","/sensapp/registry/sensors/"+sensor),
				contentType: "application/json",
				dataType:'json',
				success: 
					function (sensorsInfos, textStatus, jqXHR) {
						getMapData(visuName,sensorsInfos,displayDiv);
					},
				error: 
				function (jqXHR, textStatus, errorThrown) {
					alertMessage("error",errorThrown,5000);
				}
			});	
		});
	



	}

	//get the data
	function getMapData (visuName,sensorsInfos,displayDiv) {
	
		$.ajax({
			type: "get",
			url: sensorsInfos.backend.dataset+"?sorted=asc",
			contentType: "application/json",
			dataType:'json',
			success: 
				function (data, textStatus, jqXHR) {
					sensorCounter++;
					senMLArray.push(data);
					if (sensorCounter==sensors.length) {
						createMap(senMLArray,visuName,displayDiv);
					}
				},
			error: 
				function (jqXHR, textStatus, errorThrown) {
					alertMessage("error",errorThrown,5000);
				}
		});	
	}
	
    function createMap(senMLArray,visuName,displayDiv) {
	
	var latSensorId;
	var lonSensorId;
	
	//catch errors
	if(typeof senMLArray[0].e == 'undefined' || typeof senMLArray[1].e == 'undefined') {
	    alertMessage("error","Missing data",5000);
	    return null;
	}
	if(senMLArray[0].e[0].u=='lon') {
	    lonSensorId = 0;
	    if(senMLArray[1].e[0].u=='lat') {
		latSensorId = 1;
	    }
	    else {
		alertMessage("error","No latitude Data",5000);
		return null;
	    }
	}
	else {
	    if(senMLArray[0].e[0].u=='lat') {
		latSensorId = 0;
		if(senMLArray[1].e[0].u=='lon') {
		    lonSensorId = 1;				
		}
		else {
		    alertMessage("error","No longitude Data",5000);
		    return null;
		}
	    }
	    else {
		alertMessage("error","Sensor" + senMLArray[0].bn + " not valid",5000);
		return null;				
	    }
	}
	if (senMLArray[0].e.length!=senMLArray[1].e.length) {
	    alertMessage("error","Number of data does not match",5000);
	    return null;			
	}
	
	var lonArray = [];
	var latArray = [];
	
	if(typeof senMLArray[lonSensorId].e[0].v!='undefined') {
	    //lonArray = senMLArray[lonSensorId].e[0].v
	    $.each(senMLArray[lonSensorId].e,function(i,element) {
		lonArray.push(element.v);
	    });
	} 
	else {
	    if(typeof senMLArray[lonSensorId].e[0].sv!='undefined') {
		$.each(senMLArray[lonSensorId].e,function(i,element) {
		    lonArray.push(degreeToDouble(element.sv));
		});
	    }
	    else {
		alertMessage("error","Sensor" + senMLArray[lonSensorId].bn + " not valid",5000);
		return null;				
	    }
	}
	if(typeof senMLArray[latSensorId].e[0].v!='undefined') {
	    $.each(senMLArray[latSensorId].e,function(i,element) {
		    latArray.push(element.v);
		});
	} 
	else {
	    if(typeof senMLArray[latSensorId].e[0].sv!='undefined') {
		$.each(senMLArray[latSensorId].e,function(i,element) {
		    latArray.push(degreeToDouble(element.sv));
		});
	    }
	    else {
		alertMessage("error","Sensor" + senMLArray[latSensorId].bn + " not valid",5000);
		return null;				
	    }
	}		
	
	// drawing of the map
	var dataSize = lonArray.length;
	var lastlat = latArray[dataSize-1];
	var lastlon = lonArray[dataSize-1];
	var firstlat = latArray[0];
	var firstlon = lonArray[0];
	var center = new google.maps.LatLng((firstlat+lastlat)/2, (lastlon+firstlon)/2);
	var options = {
	    center: center,
	    zoom:2,
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    scaleControl: true
	};
	var mapDiv = document.createElement('div');
	$(mapDiv).css("height","400px");
	var map = new google.maps.Map(mapDiv, options);
	//polyligne
	for(i=1;i<dataSize;i++){
	    var route = [];
	    route.push(new google.maps.LatLng(latArray[i-1], lonArray[i-1]));
	    route.push(new google.maps.LatLng(latArray[i], lonArray[i]));
	    var itinerary = new google.maps.Polyline({
		path: route,
		strokeOpacity: 1.0,
		strokeColor: "#FF0000",
		strokeWeight: 4
	    });
	    
	    itinerary.setMap(map);
	}
	
	var start = new google.maps.LatLng(firstlat, firstlon);
	var finish = new google.maps.LatLng(lastlat, lastlon);
	var marker1 = new google.maps.Marker({
	    position: start,
	    map: map,
	    title: "Start"
	});
	var marker2 = new google.maps.Marker({
	    position: finish,
	    map: map,
	    title: "Finish"
	});
	var markerBounds = new google.maps.LatLngBounds();
	markerBounds.extend(start);
	markerBounds.extend(finish);
	map.fitBounds(markerBounds);		
	
	$('#'+displayDiv).find('#data').append(mapDiv);
    }
}

//create an associative array with all the senML data
function getDataArray(dataArray,senML,currentSensor,sensorNumber) {
	//Check out the kind of data
	//Numeric
	if(typeof senML.bt=='undefined') {
		senML.bt = 0;
	}
	
	if(typeof senML.e[0].v!='undefined') {
		$.each(senML.e, function(j,element) {
			if(typeof dataArray[(element.t+senML.bt)+""]=='undefined') {
				dataArray[(element.t+senML.bt)+""]=[];
				dataArray[(element.t+senML.bt)+""][0]=timeStampToDate(element.t+senML.bt);
				for(var j=1;j<currentSensor+1;j++) {					
					dataArray[(element.t+senML.bt)+""][j]="-";
				}
				dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.v;
				for(var j=currentSensor+2;j<sensorNumber+1;j++) {					
					dataArray[(element.t+senML.bt)+""][j]="-";
				}
			}
			else {
				dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.v;
			}
		});
	} 
	else {
		//String
		if (typeof senML.e[0].sv!='undefined') {
			$.each(senML.e, function(j,element) {
				if(typeof dataArray[(element.t+senML.bt)+""]=='undefined') {
					dataArray[(element.t+senML.bt)+""]=[];
					dataArray[(element.t+senML.bt)+""][0]=timeStampToDate(element.t+senML.bt);
					for(var j=1;j<currentSensor+1;j++) {					
						dataArray[(element.t+senML.bt)+""][j]="-";
					}
					dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.sv;
					for(var j=currentSensor+2;j<sensorNumber+1;j++) {					
						dataArray[(element.t+senML.bt)+""][j]="-";
					}
				}
				else {
					dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.sv;
				}
			});		
		} 
		else {
			//Bool
			if ( typeof senML.e[0].bv!='undefined') {
				$.each(senML.e, function(j,element) {
					if(typeof dataArray[(element.t+senML.bt)+""]=='undefined') {
						dataArray[(element.t+senML.bt)+""]=[];
						dataArray[(element.t+senML.bt)+""][0]=timeStampToDate(element.t+senML.bt);
						for(var j=1;j<currentSensor+1;j++) {					
							dataArray[(element.t+senML.bt)+""][j]="-";
						}
						dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.bv;
						for(var j=currentSensor+2;j<sensorNumber+1;j++) {					
							dataArray[(element.t+senML.bt)+""][j]="-";
						}
					}
					else {
						dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.bv;
					}
				});		
			} 
			else {
				//Summed
				if (typeof senML.e[0].s!='undefined') {
					$.each(senML.e, function(j,element) {
						if(typeof dataArray[(element.t+senML.bt)+""]=='undefined') {
							dataArray[(element.t+senML.bt)+""]=[];
							dataArray[(element.t+senML.bt)+""][0]=timeStampToDate(element.t+senML.bt);
							for(var j=1;j<currentSensor+1;j++) {					
								dataArray[(element.t+senML.bt)+""][j]="-";
							}
							dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.s;
							for(var j=currentSensor+2;j<sensorNumber+1;j++) {					
								dataArray[(element.t+senML.bt)+""][j]="-";
							}
						}
						else {
							dataArray[(element.t+senML.bt)+""][currentSensor+1]=element.s;
						}
					});		
				}			
			}
		}
	}
	return dataArray;
}

//Generate Javascript function 
function getJavascript (jsModal) {

    var parser = new DOMParser();
    var jsonVisu = [];
    var domData=$(document.createElement('div')).html(localStorage.getItem("visualisations"));
    $.each($(domData).find('tr'),function(i,visu) {
	var visuObject = {"name":$(visu).children('td:first').find('span').text(),"type":$(visu).children('td').get(1).innerHTML,"sensors":[]}
	$.each($($(visu).children('td').get(2)).children('div'),function(i,sensor) {
	    visuObject.sensors.push($(sensor).text());
	});
	jsonVisu.push(visuObject);
    });
    
    var jsString = "";
    
    jsString+="<script src='https://raw.github.com/SINTEF-9012/sensapp-admin/master/net.modelbased.sensapp.admin.gui/src/main/webapp/javascripts/jquery-1.7.2.min.js'></script>";
    
    jsString+="<script src='https://raw.github.com/SINTEF-9012/sensapp-admin/master/net.modelbased.sensapp.admin.gui/src/main/webapp/DataTables-1.9.1/media/js/jquery.dataTables.js'></script>";	
    jsString+="<script src='https://raw.github.com/SINTEF-9012/sensapp-admin/master/net.modelbased.sensapp.admin.gui/src/main/webapp/javascripts/genericFunctions.js'></script>";
    jsString+="<script src='https://raw.github.com/SINTEF-9012/sensapp-admin/master/net.modelbased.sensapp.admin.gui/src/main/webapp/javascripts/topology.js'></script>";
    jsString+="<script src='https://raw.github.com/SINTEF-9012/sensapp-admin/master/net.modelbased.sensapp.admin.gui/src/main/webapp/javascripts/dashboard.js'></script>";
    jsString+="<script src='https://raw.github.com/SINTEF-9012/sensapp-admin/master/net.modelbased.sensapp.admin.gui/src/main/webapp/highstock/js/highstock.js'></script>";
    jsString+="<script src='https://raw.github.com/SINTEF-9012/sensapp-admin/master/net.modelbased.sensapp.admin.gui/src/main/webapp/highstock/js/modules/exporting.js'></script>";
    jsString+="<script src='http://maps.googleapis.com/maps/api/js?key=AIzaSyBqAcd9tICH9qmHGL3ieuYoz3WSITCsCic&sensor=false'></script>";
    jsString+="<script>var jsonVisu="+JSON.stringify(jsonVisu)+";";
    jsString+="generateFromJson(jsonVisu,'main');</script>";
    
    var htmlString = "<html><body><div id=\"main\"><div id=\"data\"></div>";
    htmlString += jsString;
    htmlString += "</body></html>"
    
    //alert($('#'+jsModal).find('.modal-body').attr('id'));
    $('#'+jsModal).find('.modal-body').text(htmlString);
}3