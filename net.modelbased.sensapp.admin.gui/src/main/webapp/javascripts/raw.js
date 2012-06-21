function getSensor (targetURL) {
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		async:false,
		dataType:'json',
		success: 
			function (data, textStatus, jqXHR) {
				display='';
				displayCollection (data);
				$('body').html(display);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function displayArray (data) {
	display += "<div style='margin-left: 2em;'>[";
	$.each(data,function(i,element) {
		if(typeof element != 'object' || element==null) {
			display+='<div>"'+element+'"</div>';
		}
		else {
			if (element instanceof Array) {
				display+='"'+i+'"';			
				displayArray(element,"array");
			}
			else {
				display+='"'+i+'":';		
				displayCollection(element,"collection");	
			}

		}
	});
	display+=']</div>';
}

function displayCollection (data) {
	display += "<div style='margin-left: 2em;'>{";
	$.each(data,function(i,element) {
		if(typeof element != 'object' || element==null) {
			display+='<div>"'+i+'":"'+element+'"</div>';
		}
		else {
			if (element instanceof Array) {
				display+='"'+i+'":';	
				displayArray(element,"array");
			}
			else {
				display+='"'+i+'":';	
				displayCollection(element,"collection");	
			}

		}
	});
	display+='}</div>';
}