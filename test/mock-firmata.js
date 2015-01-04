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
    INPUT: 0,
    OUTPUT: 1,
    ANALOG: 2,
    PWM: 3,
    SERVO: 4,
    SHIFT: 5,
    I2C: 6,
    ONEWIRE: 7,
    STEPPER: 8,
    IGNORE: 127,
    UNKOWN: 16
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
