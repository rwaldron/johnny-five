var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  Board = five.Board,
  Stepper = five.Stepper,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });




exports["Stepper"] = {

  rpmSpeedConversion: function(done) {

  }

};
