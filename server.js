var http = require('http');
var eddystoneBeacon = require('eddystone-beacon');
var bleno = require('bleno');

var characteristic = new bleno.Characteristic({
	uuid: '98207dcc-53a2-11e7-9608-b827ebacd514',
	properties: ['read'],
	value: new Buffer('example')
});

var service = new bleno.PrimaryService({
	uuid: '98207dcc-53a2-11e7-9608-b827ebacd514',
	characteristics: [
		characteristic
	]
});

bleno.once('advertistingStart', function(err) {
	if (err) {
		throw err;
	}

	console.log('on -> advertisingStart');
	bleno.setServices([
		service
	]);
});

//var url = 'https://goo.gl/G88oMo';
//var url = 'https://smartcooler.io';
var url = 'https://goo.gl/UWeSPT';

var options = {
	name: 'Smart Cooler',
	txPwerLevel: -22,
	tlmCount: 2,
	tlmPeriod: 10
};

eddystoneBeacon.advertiseUrl(url, options);

http.createServer(function(request, response) {
	console.log('Beacon is running');
}).listen(6000);
