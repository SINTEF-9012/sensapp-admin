//return the current stored topology, are default if null
function getTopology() {
	if(localStorage.getItem("topology")!=null) {
		return eval('(' + localStorage.getItem("topology") + ')');
	}
	else {
		topology = 	{		
		  "nodes": [{ "name": "sensAppDemo", "srv": "54.247.172.50", "port": "80" }],
		  "deployment": [
			{ "service": "database.raw", "node": "sensAppDemo" },
			{ "service": "dispatch",     "node": "sensAppDemo" },
			{ "service": "notifier",     "node": "sensAppDemo" },
			{ "service": "registry",     "node": "sensAppDemo" }
		  ]
		};
		return  topology;
	}
}

//return the URL of the given service
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

	if(topology!=null) {
		var item = getObjects(topology["deployment"],"service",partner);
		var node = item[0].node;
		item = getObjects(topology["nodes"],"name",node);
		if(item[0].srv!="" && item[0].port!="")
			return "http://"+item[0].srv+":"+item[0].port+path;
		else
			return  path;
	}
	else {
		return path;
	}
}