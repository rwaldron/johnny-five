var util = require("util"),
  Emitter = require("events").EventEmitter,
  pins = require("./mock-pins");

function MockFirmata(opts) {
  opts = opts || {};
  this.name = "Mock";
  this.isReady = true;
  this.pins = opts.pins || pins.UNO;
  this.analogPins = opts.analogPins || pins.UNOANALOG;
  this.MODES = {
    INPUT:    0x00,
    OUTPUT:   0x01,
    ANALOG:   0x02,
    PWM:      0x03,
    SERVO:    0x04,
    SHIFT:    0x05,
    I2C:      0x06,
    ONEWIRE:  0x07,
    STEPPER:  0x08,
    IGNORE:   0x7F,
    UNKOWN:   0x10
  };
  this.HIGH = 1;
  this.LOW = 0;

  // set/override for special cases
  // like AdvancedFirmata
  for (var i in opts) {
    this[i] = opts[i];
  }
}

util.inherits(MockFirmata, Emitter);

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
