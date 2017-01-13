var fs = require('fs')
var ws = require('ws')

// Very simple websocket server which can stream random data
// specify the internal and the the number of data streams
// to send.

if (process.argv.length != 4) {
	console.log("Please specify the number of streams and the interval as arguments.")
	process.exit(1)
}

var n = +process.argv[2];
var sendInterval = +process.argv[3]

startupServer(n)

/**
 * Simple server, which parses the data and sends it at the specified
 * interval.
 */
function startupServer(n) {

	// start a server
	var WebSocketServer = ws.Server;
	var wss = new WebSocketServer({ port: 8081 });
	var count = 1;

	// don't do anything on incoming connections
	wss.on('connection', function connection(ws) {
		console.log('received connection');
	});

	// called at the specified interval
	function broadcast() {

		var data = { n: n };
		for (var i = 0 ; i < n ; i++) {
			data[i] = Math.random()*Math.random()*Math.random();
		}

		wss.clients.forEach(function each(client) {
			// send the message, ignoring any errors
			client.send(JSON.stringify(data), {}, function(cb) {});
		});

		count++;

	};

	// repeat the broadcast function every interval to
	// simulate a continuous stream of sensor data.
	setInterval(function() { broadcast(); }, sendInterval);
}