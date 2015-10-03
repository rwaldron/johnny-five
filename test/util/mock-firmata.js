var Board = require("board-io");
var util = require("util");
// var Emitter = require("events").EventEmitter,
var mockPins = require("./mock-pins");

function MockFirmata(opts) {
  Board.call(this, {
    quiet: true
  });

  opts = opts || {};

  this.name = "Mock";

  var pins = opts.pins || mockPins.UNO;

  pins.forEach(function(pin) {
    this._pins.push(pin);
  }, this);

  // set/override for special cases
  // like AdvancedFirmata
  for (var i in opts) {
    this[i] = opts[i];
  }
}

util.inherits(MockFirmata, Board);


MockFirmata.prototype.servoConfig = function() {};

module.exports = MockFirmata;
