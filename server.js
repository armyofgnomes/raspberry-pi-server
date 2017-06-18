var eddystoneBeacon = require('eddystone-beacon');
var express = require('express');
var app = express();

// BLE Beacon

//var url = 'https://goo.gl/G88oMo';
//var url = 'https://goo.gl/UWeSPT';
var url = 'https://smartcooler.io';

var options = {
	name: 'Smart Cooler',
	txPwerLevel: -22,
	tlmCount: 2,
	tlmPeriod: 10
};

eddystoneBeacon.advertiseUrl(url, options);

// Arduino sensor
var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyACM0', {
	baudrate: 9600,
	dataBits: 8,
	flowControl: false,
	parity: 'none',
	parser: SerialPort.parsers.readline('\n'),
	stopBits: 1,
});

var temperature = 0;
port.on('open', function() {
	console.log('open serial communication');
	port.on('data', function(data) {
		//console.log(data.toString());
		try {
			temperature = JSON.parse(data).temperature;
			//console.log(temperature);
		} catch (err) {
		}
	});
});

app.get('/', function(req, res) {
	res.send("temperature: " + temperature);
});

app.listen(80, function() {
	console.log('App is listening on port 80');
});
