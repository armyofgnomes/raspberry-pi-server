var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyACM0', {
  baudrate: 9600,
  dataBits: 8,
  flowControl: false,
  parity: 'none',
  parser: SerialPort.parsers.readline('\n'),
  stopBits: 1,
});

port.on('open', function() {
  console.log('open serial communication');
  port.on('data', function(data) {
    //console.log(data.toString());
    try {
      console.log(JSON.parse(data).temperature);
    } catch (err) {
    }
  });
});
