function getTopology() {

	var topology;

	$.ajax({
		type: "get",
		url: "./topology.json",
		async:false,
		dataType:"json",
		success: 
			function (data, textStatus, jqXHR) {
				topology = data;
			},
		error: 
			function (jqXHR, textStatus, errorThrown) {
				alert(textStatus+":"+errorThrown);
			}
	});
	return topology;
}

function getURL(topology,partner,path) {

	function getObjects(obj, key, val) {
		var objects = [];
		for (var i in obj) {
			if (!obj.hasOwnProperty(i)) continue;
			if (typeof obj[i] == 'object') {
				objects = objects.concat(getObjects(obj[i], key, val));
			} else if (i == key && obj[key] == val) {
				objects.push(obj);
			}
		}
		return objects;
	}

	var item = getObjects(topology["deployment"],"service",partner);
	var node = item[0].node;
	item = getObjects(topology["nodes"],"name",node);
	
	return "http://"+item[0].srv+":"+item[0].port+path;
}