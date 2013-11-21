var Board = require("../lib/board.js");

var Driver = function() {

  Board.Device.call(this, {});

  this.latchState = 0;
  // arduino pins that drives the shift register
  this.pins = {
    latch: 12,
    clk: 4,
    enable: 7,
    data: 8
  };
};

Driver.prototype.init = function() {
  // reset the shift register
  this.latchTx();
  // enable the outputs of the shift register
  this.firmata.digitalWrite( this.pins.latch, this.firmata.LOW );
};

Driver.prototype.latchTx = function() {
  // the cryptic bit banging
  this.firmata.digitalWrite(this.pins.latch, this.firmata.LOW);
  this.firmata.digitalWrite(this.pins.data, this.firmata.LOW);
  for (var i=0; i<8; i++) {
    this.firmata.digitalWrite(this.pins.clk, this.firmata.LOW);
    if (this.latchState & 1<<(7-i)) {
      this.firmata.digitalWrite(this.pins.data, this.firmata.HIGH);
    }
    else {
      this.firmata.digitalWrite(this.pins.data, this.firmata.LOW);
    }
    this.firmata.digitalWrite(this.pins.clk, this.firmata.HIGH);
  }
  this.firmata.digitalWrite(this.pins.latch, this.firmata.HIGH);
};

module.exports = Driver;