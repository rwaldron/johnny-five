var util = require("util"),
    events = require("events"),
    pins = require("./mock-pins");

function MockFirmata( opt ) {
  opt = opt || {};
  this.pins = opt.pins || pins.UNO;
  this.analogPins = opt.analogPins || pins.UNOANALOG;
  this.MODES = {
    INPUT: 0x00,
    OUTPUT: 0x01,
    ANALOG: 0x02,
    PWM: 0x03,
    SERVO: 0x04
  };
  this.HIGH = 1;
  this.LOW = 0;
  this.firmware = {};
}

util.inherits( MockFirmata, events.EventEmitter );

MockFirmata.prototype.digitalWrite = function() { };
MockFirmata.prototype.analogWrite = function() { };
MockFirmata.prototype.analogRead = function() { };
MockFirmata.prototype.digitalRead = function() { };
MockFirmata.prototype.pinMode = function() { };

module.exports = MockFirmata;