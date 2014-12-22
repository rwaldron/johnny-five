var util = require("util"),
  events = require("events"),
  pins = require("./mock-pins");

function MockFirmata(opt) {
  opt = opt || {};
  this.name = "Mock";
  this.isReady = true;
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

  // set/override for special cases
  // like AdvancedFirmata
  for (var i in opt) {
    this[i] = opt[i];
  }
}

util.inherits(MockFirmata, events.EventEmitter);

[
  "digitalWrite", "analogWrite", "servoWrite", "sendI2CWriteRequest", "i2cWrite",
  "analogRead", "digitalRead", "sendI2CReadRequest", "i2cRead",
  "pinMode", "queryPinState", "sendI2CConfig", "i2cConfig",
  "stepperStep", "stepperConfig", "servoConfig",
  "sendOneWireConfig", "sendOneWireSearch", "sendOneWireReset", 
  "sendOneWireWrite", "sendOneWireDelay", "sendOneWireWriteAndRead"
].forEach(function(value) {
  MockFirmata.prototype[value] = function() {};
});

MockFirmata.prototype.pulseIn = function(opt, callback) {
  callback(this.pulseValue);
};

module.exports = MockFirmata;
