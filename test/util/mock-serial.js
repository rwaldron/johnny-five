// Derived and adapted from firmata/test/MockSerialPort.js

var util = require("util"),
  events = require("events");

var MockSerialPort = function(path) {
  this.path = path;
  this.isClosed = false;
};

util.inherits(MockSerialPort, events.EventEmitter);

MockSerialPort.prototype.write = function() {
};

MockSerialPort.prototype.close = function() {
  this.isClosed = true;
};

module.exports.SerialPort = MockSerialPort;

var calls = 0;

module.exports.list = function(callback) {
  calls++;
  process.nextTick(function() {
    callback(null, calls === 2 ? [{comName: "/dev/usb"}] : []);
  });
};
