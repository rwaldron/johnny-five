// Derived and adapted from firmata/test/MockSerialPort.js

var util = require("util"),
    events = require("events");

var MockSerialPort = function( path ) {
  this.isClosed = false;
};

util.inherits( MockSerialPort, events.EventEmitter );

MockSerialPort.prototype.write = function( buffer ) {
  this.lastWrite = buffer;
};

MockSerialPort.prototype.close = function() {
  this.isClosed = true;
};

module.exports.SerialPort = MockSerialPort;
