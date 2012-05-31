function displayAllSensors(data,div) {

			var table = document.getElementById(div);

				$.each(data, function(i,element) {
				
					var newRow = document.createElement('tr');
					newRow.setAttribute("id","row"+i);

						var newName = document.createElement('td'); 
						newName.setAttribute("id",element.id);
						newName.innerHTML = element.id;
					newRow.appendChild(newName);
						
						var newDescr = document.createElement('td'); 
						newDescr.innerHTML = element.descr;
					newRow.appendChild(newDescr);				
						
						var newCreationDate = document.createElement('td'); 
						newCreationDate.innerHTML = timeStampToDate(element.creation_date);
					newRow.appendChild(newCreationDate);	
					
						var newBackend = document.createElement('td'); 
						newBackend.innerHTML = element.backend.kind;
					newRow.appendChild(newBackend);	

						var newNotificationHint = document.createElement('td'); 
						newNotificationHint.setAttribute("id","notif"+element.id);
						newNotificationHint.innerHTML = "No";
					newRow.appendChild(newNotificationHint);	

						var newActions = document.createElement('td'); 
							var newInfos = document.createElement('a'); 
							newInfos.setAttribute("href","sensorInfos.html?sensor="+element.id);
							newInfos.setAttribute("class","btn");
							newInfos.innerHTML = "<div class='icon-plus'></div>&nbsp;Infos";
						newActions.appendChild(newInfos);
						
							var newEdit = document.createElement('a'); 
							newEdit.setAttribute("href","editSensor.html?sensor="+element.id);
							newEdit.setAttribute("class","btn");	
							newEdit.innerHTML = "Edit";
						newActions.appendChild(newEdit);
							
							var newNotif = document.createElement('a');
							newNotif.setAttribute("href","notificationAdmin.html");
							newNotif.setAttribute("class","btn");
							newNotif.innerHTML = "Edit Notifications";
						newActions.appendChild(newNotif);
							
							var newDelete = document.createElement('a');
							newDelete.setAttribute("class","btn btn-danger");		
							newDelete.innerHTML = "Delete";							
						newActions.appendChild(newDelete);
		
					newRow.appendChild(newActions);	
					table.appendChild(newRow);
				
				});
				
}

function displayMoreInfos (data,div) {

				var layout = document.getElementById(div);
					var newItem = document.createElement("h2");
					newItem.innerHTML = data.id;
				layout.appendChild(newItem);		
				
					var table = document.createElement("table"); 
					table.setAttribute("style","font-size:14px;margin-left:5%;");
					table.setAttribute("cellpadding","5px");

						var newRow = document.createElement("tr");
							newItem = document.createElement("td");
							newItem.setAttribute("style","font-weight:bold;");
							newItem.innerHTML = "Name :";
						newRow.appendChild(newItem);
							newItem = document.createElement("td");
							newItem.innerHTML = data.id;					
						newRow.appendChild(newItem);
					table.appendChild(newRow);

							
						newRow = document.createElement("tr");
							newItem = document.createElement("td");
							newItem.setAttribute("style","font-weight:bold;");
							newItem.innerHTML = "Description :";
						newRow.appendChild(newItem);
							newItem = document.createElement("td");
							newItem.innerHTML = data.descr;					
						newRow.appendChild(newItem);
					table.appendChild(newRow);						

					
						newRow = document.createElement("tr");
							newItem = document.createElement("td");
							newItem.setAttribute("style","font-weight:bold;");
							newItem.innerHTML = "Backend :";
						newRow.appendChild(newItem);
							newItem = document.createElement("td");
							newItem.innerHTML = data.backend.kind;					
						newRow.appendChild(newItem);
					table.appendChild(newRow);		
			
		
						newRow = document.createElement("tr");
							newItem = document.createElement("td");
							newItem.setAttribute("style","font-weight:bold;");
							newItem.innerHTML = "Descriptor :";
						newRow.appendChild(newItem);
							newItem = document.createElement("td");
							newItem.innerHTML = data.backend.descriptor;					
						newRow.appendChild(newItem);
					table.appendChild(newRow);	

					newRow = document.createElement("tr");
							newItem = document.createElement("td");
							newItem.setAttribute("style","font-weight:bold;");
							newItem.innerHTML = "Dataset :";
						newRow.appendChild(newItem);
							newItem = document.createElement("td");
							newItem.innerHTML = data.backend.dataset;					
						newRow.appendChild(newItem);
					table.appendChild(newRow);	
					
						if(data.update_time!=null) {
							newRow = document.createElement("tr");
								newItem = document.createElement("td");
								newItem.setAttribute("style","font-weight:bold;");
								newItem.innerHTML = "Update Time :";
							newRow.appendChild(newItem);
								newItem = document.createElement("td");
								newItem.innerHTML = data.infos.update_time;					
							newRow.appendChild(newItem);	
						table.appendChild(newRow);							
						}
						
						if(data.infos.loc!=null) {
							if(data.infos.loc.longitude!=null) {
								newRow = document.createElement("tr");
									newItem = document.createElement("td");
									newItem.setAttribute("style","font-weight:bold;");
									newItem.innerHTML = "Longitude :";
								newRow.appendChild(newItem);
									newItem = document.createElement("td");
									newItem.innerHTML = data.infos.loc.longitude;					
								newRow.appendChild(newItem);
							table.appendChild(newRow);	
							}
							if(data.infos.loc.latitude!=null) {
								newRow = document.createElement("tr");
									newItem = document.createElement("td");
									newItem.setAttribute("style","font-weight:bold;");
									newItem.innerHTML = "Latitude :";
								newRow.appendChild(newItem);
									newItem = document.createElement("td");
									newItem.innerHTML = data.infos.loc.latitude;					
								newRow.appendChild(newItem);
							table.appendChild(newRow);	
							}
						}
						
						if(data.infos.tags!=null) {
							$.each(data.infos.tags, function(i,element) {
								newRow = document.createElement("tr");
									newItem = document.createElement("td");
									newItem.setAttribute("style","font-weight:bold;");
									newItem.innerHTML = i+" :";
								newRow.appendChild(newItem);
									newItem = document.createElement("td");
									newItem.innerHTML = element;					
								newRow.appendChild(newItem);
							table.appendChild(newRow);	
							});
						}
		
				layout.appendChild(table);
}

function displayNotifierYes (sensor) {

	var notificationHint = document.getElementById("notif"+sensor);
	notificationHint.innerHTML = "Yes";
}

function timeStampToDate (timestamp) {

	var time = new Date(timestamp * 1000);
	return time.toString();
}

function fillInputValues(data) {

	document.getElementById('id').value = data.id;
	document.getElementById('descr').value = data.descr;
	document.getElementById('creation_date').value = data.creation_date;
	document.getElementById('kind').value = data.backend.kind;
	if(typeof data.infos.update_time != 'undefined'){
		document.getElementById('update_time').value = timeStampToDate(data.infos.update_time);
	}
 	if(typeof data.infos.loc != 'undefined'){
		if(typeof data.infos.loc.longitude != 'undefined') {
			document.getElementById('longitude').value = data.infos.loc.longitude;
		}
		if(typeof data.infos.loc.longitude != 'undefined') {
			document.getElementById('latitude').value = data.infos.loc.latitude;
		}
	}
}

function tableToJqueryDataTable (div) {

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
			} );
				
	$(document).ready(function() {
			var tableId = document.getElementById(div).parentNode.id;
		$("#"+tableId).dataTable({
			"sDom": "<'row'<'span8'l><'span8'f>r>t<'row'<'span8'i><'span8'p>>",
			"sPaginationType": "bootstrap",
			"oLanguage": {
			"sLengthMenu": "_MENU_ records per page"
			}
		});
	});
}