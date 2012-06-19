function getSensor (targetURL) {
	$.ajax({
		type: "get",
		url: targetURL,
		contentType: "application/json",
		async:false,
		dataType:'json',
		success: 
			function (data, textStatus, jqXHR) {
				display=''
				displayRaw (data);
				display+="}";
				$('body').html(display);
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alertMessage("error",errorThrown,5000);
			}
	});
}

function displayRaw (data) {

	display += "<div style='margin-left: 2em;'>{";
	$.each(data,function(i,element) {
		if(typeof element != 'object' || element==null) {
			display+='<div>"'+i+'":"'+element+'"</div>';
		}
		else {
			display+='<div>"'+i+'":</div>';
			displayRaw(element);
			display+='}</div>';
		}
	});
}