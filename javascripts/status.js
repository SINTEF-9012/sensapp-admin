function displayTopology(topologyDiv) {		//get current topology	var topology=getTopology();	var nodesBody = $('#'+topologyDiv).find('#nodes').find('tbody');		var nodeList = $(document.createElement('select'));		//display nodes	$.each(topology.nodes, function(i,element) {		nodesBody.append(			//new Row			$(document.createElement('tr'))				.append(					//new node name					$(document.createElement('td'))						.css("height","30px")						.attr("class","edit-name")						.append(							//classic view							$(document.createElement('div'))								.text(element.name))						.append(							//editable view							$(document.createElement('input'))								.attr("value",element.name)								.hide())				)				.append(					//new server					$(document.createElement('td'))						.css("height","30px")						.attr("class","edit")						.append(							//classic view							$(document.createElement('div'))								.text(element.srv))						.append(							//editable view							$(document.createElement('input'))								.attr("value",element.srv)								.hide())				)				.append(					//new port					$(document.createElement('td'))						.css("height","30px")						.attr("class","edit")						.append(							//classic view							$(document.createElement('div'))								.text(element.port))						.append(							//editable view							$(document.createElement('input'))								.attr("value",element.port)								.hide())				)				.append(					//Delete					$(document.createElement('td'))						.css("height","30px")						.append(							$(document.createElement('b'))								.attr('class','btn btn-danger')								.css("font-size","16px")								.click(function () {									$(this).closest('tr').remove();									$('#'+topologyDiv).find('#deployment').find('option[value="'+$(this).closest('tr').find('td:first').find('div').text()+'"]').remove();									$('#'+topologyDiv).find('#deployment').find('select[value="'+$(this).closest('tr').find('td:first').find('div').text()+'"]').attr("value","");									$('#'+topologyDiv).find('#deployment').find('select[value="'+$(this).closest('tr').find('td:first').find('div').text()+'"]').prev().text("");								})								.html("&times")						)				)		);		nodeList.append($(document.createElement('option')).val(element.name).text(element.name));	});		//display deployement	var deploymentBody = $('#'+topologyDiv).find('#deployment').find('tbody');			$.each(topology.deployment, function(i,element) {			deploymentBody.append(					$(document.createElement('tr'))							.append(								$(document.createElement('td'))									.css("height","30px")									.append(										$(document.createElement('div'))											.text(element.service))							)							.append(								$(document.createElement('td'))									.css("height","30px")									.attr("class","edit")									.append(										$(document.createElement('div'))										.text(element.node))										.append(										$(nodeList.clone())											.attr("value",element.node)											.hide())							)			);		});	//make cells editable	setEditable(topologyDiv);}function setEditable(topologyDiv) {		//set editable when clicking	$('#'+topologyDiv).find('.edit,.edit-name').click(function(){		$(this).children('div').hide();		$(this).children(':input').show();		$(this).children(':input').focus();	}); 	//set classic view when focus unset	$('#'+topologyDiv).find('.edit').find(':input').blur(function() {	    $(this).prev().text(this.value);		$(this).hide();		$(this).prev().show();    }); 	//set classic view on backspace	$('#'+topologyDiv).find('.edit').find(':input').keypress(function(event) {		if (event.keyCode == '13') {			$(this).prev().text(this.value);			$(this).hide();			$(this).prev().show();		}	});		//special process for node names	$('#'+topologyDiv).find('.edit-name').find(':input').blur(function() {			var isValid=true;			var nextValue=this.value;			var otherRows = $('#'+topologyDiv).find('#nodes').find('tbody').find('tr').not($(this).closest('tr'));			//check if name already exists			$.each(otherRows,function (i,row) {				if($(row).find('td').find('div')[0].innerHTML==nextValue) {					isValid=false;				}			});			//if not exists			if(isValid==true) {				//add to deyploment node selection				var optionsToEdit = $('#'+topologyDiv).find('option[value="'+$(this).prev().text()+'"]');				optionsToEdit.val(this.value);								optionsToEdit.text(this.value);				var selectToEdit = $('#'+topologyDiv).find('select[value="'+$(this).prev().text()+'"]');				selectToEdit.attr("value",this.value);				selectToEdit.prev().text(this.value);				$(this).prev().text(this.value);			}			//if already exists			else {				this.value = $(this).prev().text()				alertMessage("error","Node already exists",5000);			}				$(this).hide();				$(this).prev().show();	});	//same for pressing backspace	$('#'+topologyDiv).find('.edit-name').find(':input').keypress(function(event) {		if (event.keyCode == '13') {			var isValid=true;			var nextValue=this.value;			var otherRows = $('#'+topologyDiv).find('#nodes').find('tbody').find('tr').not($(this).closest('tr'));			$.each(otherRows,function (i,row) {				if($(row).find('td').find('div')[0].innerHTML==nextValue) {					isValid=false;				}			});			if(isValid==true) {				var optionsToEdit = $('#'+topologyDiv).find('option[value="'+$(this).prev().text()+'"]');				optionsToEdit.val(this.value);								optionsToEdit.text(this.value);				var selectToEdit = $('#'+topologyDiv).find('select[value="'+$(this).prev().text()+'"]');				selectToEdit.attr("value",this.value);				selectToEdit.prev().text(this.value);				$(this).prev().text(this.value);			}			else {				this.value = $(this).prev().text()				alertMessage("error","Node already exists",5000);			}				$(this).hide();				$(this).prev().show();		}	});	 }//refresh functionfunction reload(topologyDiv) {	$('#'+topologyDiv).find('tbody').empty();	displayTopology(topologyDiv);}//regsiter new topology function register(topologyDiv) {	var json = { "nodes":[],"deployment":[]};	var nodesRows = $('#'+topologyDiv).find('#nodes').find('tbody').find('tr');	$.each(nodesRows,function (i,row) {		if($(row).find('td').find('div')[0].innerHTML!="") {			var srv=$(row).find('td').find('div')[1].innerHTML			if(srv=="localhost") {				srv = "127.0.0.1";			}			json.nodes.push({"name":$(row).find('td').find('div')[0].innerHTML,"srv":srv,"port":$(row).find('td').find('div')[2].innerHTML});		}	});	var deploymentRows = $('#'+topologyDiv).find('#deployment').find('tbody').find('tr');	$.each(deploymentRows,function (i,row) {		json.deployment.push({"service":$(row).find('td').find('div')[0].innerHTML,"node":$(row).find('td').find('div')[1].innerHTML});	});	localStorage.setItem("topology", JSON.stringify(json));	alertMessage("success","configuration stored",5000);}//add new node function addEvent(div,elementNames,refValue) {	if($('#'+div).find("#nodes").find('tbody').find('tr:last').find('td').find('div').html() != "")	{		$('#'+refValue).attr('value',$('#'+refValue).attr('value') + 1);		var newRow = $(document.createElement('tr'));		newRow.append(			$(document.createElement('td'))				.attr("class","edit-name")				.css("height","30px")				.append(					$(document.createElement('div')))				.append(					$(document.createElement('input'))						.hide())		);						for(var i=0;i<$('#'+div).find("#nodes").find('th').size()-2;i++) {			newRow.append(				$(document.createElement('td'))					.attr("class","edit")					.css("height","30px")					.append(						$(document.createElement('div')))					.append(						$(document.createElement('input'))							.hide())			);		}		newRow.append(			$(document.createElement('td'))				.css("height","30px")				.append(					$(document.createElement('b'))						.attr('class','btn btn-danger')						.click(function () {						$(this).closest('tr').remove();					})					.html("&times")				)		);	$('#'+div).find("#nodes").find('tbody').append(newRow);	var selectLists = $('#'+div).find("#deployment").find('select');	$.each(selectLists,function (i,select) {		$(select).append($(document.createElement('option')).val("").text(""));	});	setEditable(div);	}}