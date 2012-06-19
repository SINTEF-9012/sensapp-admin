//*********************************//*********************************// Sensor Display Functions//**********************************function getAllSensorsForVisu (targetURL,table) {	$.ajax({		type: "get",		url: targetURL,		contentType: "application/json",		dataType:'json',		success: 			function (data, textStatus, jqXHR) {				if (data.length!=0) {					displayAllSensorsForVisu(data,table);				}			},		error: 			function (jqXHR, textStatus, errorThrown) {				alertMessage("error",errorThrown,5000);			}	});}function displayAllSensorsForVisu (data,table) {				var sensorArray = new Array();	var columnsJson = [{"sTitle":"Name"},{"sTitle":"Description"},{"sTitle":"Actions"}];	$.each(data, function (i,element) {		sensorArray.push( [createNameColumn(element.id,"sensor").html(),createDescriptionColumn(element,"sensor").html(),createVisuActions(element).html()] );	});	var displayJson = { "aaData": sensorArray, "aoColumn":columnsJson};	$('#'+table).dataTable(displayJson).$("div[rel=popover]").popover({placement:'right'});}function createVisuActions(sensor) {	return $(document.createElement('td'))		.append(				//View Button			$(document.createElement('a'))				.attr("class","btn")				.attr("href","#view")				.attr("onclick","getData(getURL(topology,'database."+sensor.backend.kind+"','"+sensor.backend.dataset+"'),'"+sensor.id+"','"+sensor.backend.kind+"','table','data');")				.text("Table View")		)		.append(				//View Button			$(document.createElement('a'))				.attr("class","btn")				.attr("href","#view")				.attr("onclick","getData(getURL(topology,'database."+sensor.backend.kind+"','"+sensor.backend.dataset+"'),'"+sensor.id+"','"+sensor.backend.kind+"','timeSerie','data');")				.text("Time serie View")		)		.append(			//Remove View Button			$(document.createElement('a'))				.attr("href","#edit-Sensor")				.attr("onclick","removeView('data')")				.attr("class","btn btn-danger")				.text("Remove View")		);}//*********************************// Raw Display Functions//**********************************function getData(targetURL,sensorName,dataType,viewType,div) {	$.ajax({		type: "get",		url: targetURL,		headers: { 			Accept : "application/json"		},		async:false,		dataType: 'json',		success:			function (data, textStatus, jqXHR) {				switch (dataType) {					case "raw":						if(typeof data.e!='undefined') {							switch (viewType) {								case "table":									displayRawData(data,'rawDataTable');									break;								case "timeSerie":									displayRawTimeSerie(data,'rawTimeSerie');									break;								default:									break;							}						}						break;					default:						break;				}			},		error:			function (jqXHR, textStatus, errorThrown) {				alertMessage("error",errorThrown,5000);			}	});}	function addRowToRawDatable(element,dataTable) {	$('#'+dataTable).dataTable().fnAddData( [		timeStampToDate(element.t),		element.v + " " + element.u		] );}function removeView(div) {	$('#'+div).find('.dataTables_wrapper').hide();	$('#'+div).find('#rawTimeSerie').hide();	$('#'+div).find('.dataTables_wrapper').find('table').dataTable().fnClearTable();	$('#'+div).find('.dataTables_wrapper').find('table').dataTable().fnDestroy();	rawChart.destroy ();}function displayRawData(data,dataTable) {			$('#'+dataTable).dataTable().fnClearTable();	$('#'+dataTable).dataTable().fnDestroy();		var dataArray = new Array();	var columnsJson = [{"sTitle":"Time"},{"sTitle":"Value"}];	alert(data.e[0].v);	if(typeof data.e[0].v!='undefined') {		if(data.bt=='undefined') {			$.each(data.e, function (i,element) {				dataArray.push( [timeStampToDate(element.t),element.v + " " + element.u] );			});		}		else {			$.each(data.e, function (i,element) {				dataArray.push( [timeStampToDate(element.t+data.bt),element.v + " " + element.u] );			});		}	} else { 		if (typeof data.e[0].sv!='undefined') {			if(data.bt=='undefined') {				$.each(data.e, function (i,element) {					dataArray.push( [timeStampToDate(element.t),element.sv + " " + element.u] );				});			}			else {				$.each(data.e, function (i,element) {					dataArray.push( [timeStampToDate(element.t+data.bt),element.sv + " " + element.u] );				});			}		} else { 			if (typeof data.e[0].bv!='undefined') {				if(data.bt=='undefined') {					$.each(data.e, function (i,element) {						dataArray.push( [timeStampToDate(element.t),element.bv] );					});				}				else {					$.each(data.e, function (i,element) {						dataArray.push( [timeStampToDate(element.t+data.bt),element.bv] );					});				}			}		}	}				var displayJson = { "aaData": dataArray, "aoColumn":columnsJson};	$('#'+dataTable).dataTable(displayJson);	$('#'+dataTable).show();}function displayRawTimeSerie(data,div) {	$('#'+div).show();	highchartsData=SenMLToHighcharts(data);    $(document).ready(function() {        rawChart = new Highcharts.Chart({            chart: {                renderTo: div,                type: 'line',				zoomType: 'x',                marginRight: 130,                marginBottom: 25            },            title: {                text: 	data.bn,                x: -20 //center            },            yAxis: {                plotLines: [{                    value: 0,                    width: 1,                    color: '#808080'                }]            },            tooltip: {                formatter: function() {                        return '<b>'+ this.series.name +'</b><br/>'+                        this.x +': '+ this.y +'�C';                }            },            legend: {                layout: 'vertical',                align: 'right',                verticalAlign: 'top',                x: -10,                y: 100,                borderWidth: 0            },            series: [{				data: highchartsData			}]        });    });}//*********************************// Raw Data Transformation//*********************************function SenMLToHighcharts(senMLData) {	var highchartsData = new Array();	$.each(senMLData.e, function (i,element) {			highchartsData.push([element.t-senMLData.bt,element.v]);				});	highchartsData.sort(sortByTime);	$.each(highchartsData, function (i,element) {			element[0] = timeStampToDate(element[0]);			});		return highchartsData;	}function sortByTime(a, b){  var aTime = a[0];  var bTime = b[0];   return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));}