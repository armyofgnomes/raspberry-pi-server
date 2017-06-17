var http = require('http');
var eddystoneBeacon = require('eddystone-beacon');

var url = 'https://smartcooler.io';

var options = {
	name: 'Raspberry Pi',
	txPwerLevel: -22,
	tlmCount: 2,
	tlmPeriod: 10
};

eddystoneBeacon.advertiseUrl(url, options);

http.createServer(function(request, response) {
	console.log('Beacon is running');
}).listen(6000);
