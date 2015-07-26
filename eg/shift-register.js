var five = require("../lib/johnny-five");
var board = new five.Board();

// For use with 74HC595 chip

board.on("ready", function() {
  var register = new five.ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  var value = 0;

  function next() {
    value = value > 0x11 ? value >> 1 : 0x88;
    register.send(value);
    setTimeout(next, 200);
  }

  next();

});
