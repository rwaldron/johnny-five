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
}

util.inherits( MockFirmata, events.EventEmitter );

["digitalWrite", "analogWrite", "analogRead", "digitalRead", "pinMode"].forEach(function (value) {
  MockFirmata.prototype[value] = function () {};
});

MockFirmata.prototype.pulseIn = function (opt, callback) {
  callback(this.pulseValue);
};

module.exports = MockFirmata;
