const {Board, ShiftRegister} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const register = new ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4,
    }
  });
  let number = 0;
  let decimal = 0;

  // Display numbers 0-9, one at a time in a loop.
  // Shows just the number for a half second, then
  // the number + a decimal point for a half second.
  setInterval(() => {
    register.display(number + (decimal && "."));

    if (decimal) {
      number++;
    }

    if (number === 10) {
      number = 0;
    }

    decimal ^= 1;
  }, 500);
});
