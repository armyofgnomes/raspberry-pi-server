var eddystoneBeacon = require('eddystone-beacon');
var express = require('express');
var bleno = require('eddystone-beacon/node_modules/bleno');
var app = express();

// BLE Temperature
const NO_SAMPLES = 10;
class TemperatureCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: 'f94dcd49-148b-47e6-b102-f115223cd282',
      properties: ['read', 'notify'],
      value: null
    });

    this._lastValue = 0;
    this._total = 0;
    this._samples = 0;
    this._onChange = null;
  }

  onReadRequest(offset, callback) {
    var data = new Buffer(8);
    data.writeDoubleLE(this._lastValue, 0);
    callback(bleno.Characteristic.RESULT_SUCCESS, data);
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("Subscribed to temperature change.");
    this._onChange = updateValueCallback;
    this._lastValue = undefined;
  }

  onUnsubscribe() {
    console.log("Unsubscribed to temperature change.");
    this._onChange = null;
  }

  valueChange(value) {
    this._total += value;
    this._samples++;

    if (this._samples < NO_SAMPLES) {
      return;
    }

    var newValue = (this._total / NO_SAMPLES).toFixed(2);
    this._total = 0;
    this._samples = 0;

    if (this._lastValue && Math.abs(this._lastValue - newValue) < 0.1) {
      return;
    }

    this._lastValue = newValue;

    var data = new Buffer(8);

    data.writeDoubleLE(newValue, 0);

    if (this._onChange) {
      console.log('Notifying ' + newValue);
      this._onChange(data);
    }
  }
}

// BLE Beacon

//var url = 'https://goo.gl/G88oMo';
//var url = 'https://goo.gl/UWeSPT';
var url = 'https://smartcooler.io';

var options = {
  name: 'Smart Cooler',
};

bleno.on('stateChange', function(state) {
  console.log('state change ' + state);
  if (state === 'poweredOn') {
    bleno.startAdvertising('Smart Cooler', ['e24e9ac7-a763-4f1d-a582-010447333ffc']);
    eddystoneBeacon.advertiseUrl(url, options);
  } else {
    bleno.stopAdvertising();
  }
});

var temperatureCharacteristic = new TemperatureCharacteristic;
bleno.on('advertisingStart', function(error) {
  if (error) {
    console.log(error);
  }

  bleno.setServices([new bleno.PrimaryService({
    uuid: 'e24e9ac7-a763-4f1d-a582-010447333ffc',
    characteristics: [temperatureCharacteristic]
  })]);
});

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

var jsonData = {};
port.on('open', () => {
  console.log('open serial communication');
  port.on('data', (data) => {
    //console.log(data.toString());
    try {
      jsonData = JSON.parse(data);
    } catch (err) {
    }

    if (jsonData.temperature) {
      temperatureCharacteristic.valueChange(jsonData.temperature);
    }
  });
});

app.use(express.static('public'));

app.get('/data', function(req, res) {
  res.json(jsonData);
});

app.listen(80, function() {
  console.log('App is listening on port 80');
});
