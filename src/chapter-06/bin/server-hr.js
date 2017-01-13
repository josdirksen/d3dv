var fs = require('fs')
var ws = require('ws')

// Very simple websocket server, which streams hr data
//
// be started by calling node ./server.js, then specify the file
// to stream, the interval, and the numberofrecords to skip
//
if (process.argv.length != 5) {
	console.log("Please specify the data to stream ," +
		" the send interval and the records to skip as arguments")
	process.exit(1)
}

var sendInterval = +process.argv[3]
var toSkip = +process.argv[4]

fs.readFile(process.argv[2], 'utf8', function (err,data) {
	if (err) {
		console.log("Error loading file", err); process.exit(1)
	}

	startupServer(data.split('\n'))
});

/**
 * Simple server, which parses the data and sends it at the specified
 * interval.
 */
function startupServer(data) {

	// convert the data into a simple json structure
	var processed = data.map(function(el) {
		var splitted = el.trim().split(/\s+/);
		return {
			"id" : splitted[0],
			"resp" : +splitted[1],
			"ecg" : +splitted[2]
		}
	})

	// start a server
	var WebSocketServer = ws.Server;
	var wss = new WebSocketServer({ port: 8081 });

	// don't do anything on incoming connections
	wss.on('connection', function connection(ws) {
		console.log('received connection');
	});

	// called at the specified interval
	function broadcast() {
		var skipped = processed.splice(0, toSkip);
		var toSend = processed.shift();
		wss.clients.forEach(function each(client) {
			// send the message, ignoring any errors
			client.send(JSON.stringify(toSend), {}, function(cb) {});
		});

		skipped.forEach(function(el) {processed.push(el)})
		processed.push(toSend)
	};

	// repeat the broadcast function every interval to
	// simulate a continuous stream of sensor data.
	setInterval(function() { broadcast(); }, sendInterval);
}