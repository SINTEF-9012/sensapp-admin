function timeStampToDate (timestamp) {
	var time = new Date(timestamp * 1000);

   var yyyy = time.getFullYear().toString();
   var mm = (time.getUTCMonth()+1).toString(); // getMonth() is zero-based
   var dd  = time.getUTCDate().toString();

	var hh = time.getHours().toString();
 	var min = time.getMinutes().toString();
	var ss = time.getSeconds().toString();

   return yyyy +"-"+(mm[1]?mm:"0"+mm[0]) +"-"+(dd[1]?dd:"0"+dd[0]) + " " + (hh[1]?hh:"0"+hh[0]) + ":" + (min[1]?min:"0"+min[0]) +":" + (ss[1]?ss:"0"+ss[0]);

}

function degreeToDouble(degree) {

	split=degree.split(" ");

	if(typeof split[1] == 'undefined') {
		split[1]=0;
	}
	if(typeof split[2] == 'undefined') {
		split[2]=0;
	}
	if(typeof split[3] == 'undefined') {
		split[3]=0;
	}
	var doubleValue=parseFloat(split[1])+parseFloat(split[2])/60+parseFloat(split[3])/3600;
	if(split[0]=="S" || split[0]=="W") {
		doubleValue = -doubleValue;
	}
	return doubleValue;
}

//get GET values
function getQuerystring(key, default_)
{
  if (default_==null) default_="";
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
  var qs = regex.exec(window.location.href);
  if(qs == null)
    return default_;
  else
    return qs[1];
}

//Add Link to Raw Data
function createNameColumn(sensorId) {
	return $(document.createElement('div'))
			.append(
				$(document.createElement('a'))
					.attr("id",sensorId)
					.attr("rel","tooltip")
					.attr("href","#")
					.attr('onclick', 'clickNameColumn(this);')
					.text(sensorId)
			);
}

// Manage click on the name column
function clickNameColumn(a) {
	$(a).parents('tr').find('a.btn:first').click();
	return false;
}

//Insert Tags in Description
function createDescriptionColumn(sensor,type) {

	var popoverContent;
	switch (type) {
		case "sensor":
				popoverContent = getPopoverContent(sensor);
			break;
		case "composite":
				popoverContent = getCompositePopoverContent(sensor);
			break;
		case "notifier":
				popoverContent = getPopoverContent(sensor);
			break;
		default:
			popoverContent = "";
			break;
	}

	var text;
	if(sensor.descr!="")
		text = sensor.descr;
	else
		text = "n.a.";

	if (popoverContent != "") {
	var div = $(document.createElement('div'))
					.attr("rel","popover")
					.attr("data-original-title","Additional Infos")
					.attr("data-content",popoverContent)
					.attr("class","icon-plus-sign");
		return $(document.createElement('div')).append(text).append(' ').append(div);
	}
	else
		return $(document.createElement('div')).append(text);
}

//Create the popover content
function getPopoverContent(sensor) {
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
	return popoverContent;
}

function getCompositePopoverContent(sensor) {

	var popoverContent = "";

	if(sensor.tags!=null) {
		$.each(sensor.tags, function(i,element) {
			popoverContent = popoverContent + "<li>"+i+" : " + element + "</li>";
		});
	}
	return popoverContent;
}

//Alert Messages
function alertMessage(type,message,timeout) {
	alertDiv = $(document.createElement('div'));

	switch (type) {
		case "success":
			alertDiv.attr("class","alert alert-success fade in")
					.html("<b>Success.</b> "+message);
			break;
		case "error":
			alertDiv.attr("class","alert alert-error fade in")
					.html("<b>Error.</b> "+message);
			break;
		case "warning":
			alertDiv.attr("class","alert fade in")
					.html("<b>Warning.</b> "+message);
			break;
		default:
			break;
	}

	alertDiv.append(
			$(document.createElement('a'))
				.attr("class","close")
				.attr("data-dismiss","alert")
				.html("&times;")
		);

	$('#alert-div').append(alertDiv);
	if(typeof timeout!='undefined')
		window.setTimeout(function() { $('#alert-div').find(':contains('+message+')').remove(); }, timeout);
}

//generic remove Datatable Row
function removeRow(row,dataTable) {
	var oTable = $('#'+dataTable).dataTable();
	oTable.fnDeleteRow(oTable.fnGetPosition(row));
 }

//Resize the table
 function resizeDatatable(table) {
	$('#'+table).dataTable().fnAdjustColumnSizing();
}

//Make a Boostrap style Datatable
function tableToJqueryDataTable (data,columns,div,sorting) {

			if(typeof sorting == 'undefined') {
				sorting='asc';
			}

			/* Default class modification */
			$.extend( $.fn.dataTableExt.oStdClasses, {
				"sSortAsc": "header headerSortDown",
				"sSortDesc": "header headerSortUp",
				"sSortable": "header"
			} );

			/* API method to get paging information */
			$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
			{
				return {
					"iStart":         oSettings._iDisplayStart,
					"iEnd":           oSettings.fnDisplayEnd(),
					"iLength":        oSettings._iDisplayLength,
					"iTotal":         oSettings.fnRecordsTotal(),
					"iFilteredTotal": oSettings.fnRecordsDisplay(),
					"iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
					"iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
				};
			}

			/* Bootstrap style pagination control */
			$.extend( $.fn.dataTableExt.oPagination, {
				"bootstrap": {
					"fnInit": function( oSettings, nPaging, fnDraw ) {
						var oLang = oSettings.oLanguage.oPaginate;
						var fnClickHandler = function ( e ) {
							e.preventDefault();
							if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
								fnDraw( oSettings );
							}
						};

						$(nPaging).addClass('pagination').append(
							'<ul>'+
								'<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
								'<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
							'</ul>'
						);
						var els = $('a', nPaging);
						$(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
						$(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
					},

					"fnUpdate": function ( oSettings, fnDraw ) {
						var iListLength = 5;
						var oPaging = oSettings.oInstance.fnPagingInfo();
						var an = oSettings.aanFeatures.p;
						var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

						if ( oPaging.iTotalPages < iListLength) {
							iStart = 1;
							iEnd = oPaging.iTotalPages;
						}
						else if ( oPaging.iPage <= iHalf ) {
							iStart = 1;
							iEnd = iListLength;
						} else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
							iStart = oPaging.iTotalPages - iListLength + 1;
							iEnd = oPaging.iTotalPages;
						} else {
							iStart = oPaging.iPage - iHalf + 1;
							iEnd = iStart + iListLength - 1;
						}

						for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
							// Remove the middle elements
							$('li:gt(0)', an[i]).filter(':not(:last)').remove();

							// Add the new list items and their event handlers
							for ( j=iStart ; j<=iEnd ; j++ ) {
								sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
								$('<li '+sClass+'><a href="#">'+j+'</a></li>')
									.insertBefore( $('li:last', an[i])[0] )
									.bind('click', function (e) {
										e.preventDefault();
										oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
										fnDraw( oSettings );
									} );
							}

							// Add / remove disabled classes from the static elements
							if ( oPaging.iPage === 0 ) {
								$('li:first', an[i]).addClass('disabled');
							} else {
								$('li:first', an[i]).removeClass('disabled');
							}

							if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
								$('li:last', an[i]).addClass('disabled');
							} else {
								$('li:last', an[i]).removeClass('disabled');
							}
						}
					}
				}
			});
	$(document).ready(function() {
		$("#"+div).dataTable({
			"aaData": data,
			"aaSorting": [[ 0, sorting ]],
			"aoColumn": columns,
			"sPaginationType": "bootstrap",
			"oLanguage": {
				"sLengthMenu": "_MENU_ records per page" ,
			}
		}).$("div[rel=popover]").popover({placement:'right'});
	});
}

//*********************************
// Raw Data Transformation
//*********************************

function SenMLToHighcharts(senMLData) {
	var highchartsData = new Array();
	if(typeof senMLData.e[0].v!='undefined') {
		if(typeof senMLData.bt=='undefined') {
			$.each(senMLData.e, function (i,element) {
					highchartsData.push([element.t*1000,element.v]);
			});
		}
		else {
			$.each(senMLData.e, function (i,element) {
					highchartsData.push([(element.t+senMLData.bt)*1000,element.v]);
			});
		}
	} else {
		if(typeof senMLData.e[0].bv!='undefined') {
			if(typeof senMLData.bt=='undefined') {
				$.each(senMLData.e, function (i,element) {
					var val;
					if(element.bv) {
						val=1;
					}
					else {
						val=0;
					}
					highchartsData.push([element.t*1000,val]);
			});
		}
			else {
				$.each(senMLData.e, function (i,element) {
					var val;
					if(element.bv) {
						val=1;
					}
					else {
						val=0;
					}
					highchartsData.push([(element.t+senMLData.bt)*1000,val]);
				});
			}
		}
	}
	//highchartsData.sort(sortByTime);

	return highchartsData;
}

function sortByTime(a, b){
  var aTime = a[0];
  var bTime = b[0];
  return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
}

function senmlToCSV (jsonData) {

	var csv="";
	if(typeof jsonData.e!='undefined') {
		if(jsonData.bt=='undefined') {
			jsonData.bt=0;
		}
		if(jsonData.e[0].v!='undefined') {
			$.each(jsonData.e, function(i,element) {
				csv+='"'+element.t+jsonData.bt+'","'+element.v+'"<br>';
			});
		}
		else {
			if(jsonData.e[0].sv!='undefined') {
				$.each(jsonData.e, function(i,element) {
					csv+='"'+element.t+jsonData.bt+'","'+element.sv+'"<br>';
				});
			}
			else {
				if(jsonData.e[0].bv!='undefined') {
					$.each(jsonData.e, function(i,element) {
						csv+='"'+element.t+jsonData.bt+'","'+element.bv+'"<br>';
					});
				}
				else {
					if(jsonData.e[0].s!='undefined') {
						$.each(jsonData.e, function(i,element) {
							csv+='"'+element.t+jsonData.bt+'","'+element.s+'"<br>';
						});
					}
				}
			}
		}
	}
	return csv;
}