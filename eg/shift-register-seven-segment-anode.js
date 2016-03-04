var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var register = new five.ShiftRegister({
    isAnode: true,
    pins: {
      data: 2,
      clock: 3,
      latch: 4,
      reset: 9,
    }
  });
  var number = 0;
  var decimal = 0;

  register.reset();

  // Display numbers 0-9, one at a time in a loop.
  // Shows just the number for a half second, then
  // the number + a decimal point for a half second.
  setInterval(function() {
    register.display(number + (decimal && "."));

    if (decimal) {
      number++;
    }

    if (number > 9) {
      number = 0;
    }

    decimal ^= 1;
  }, 500);
});
