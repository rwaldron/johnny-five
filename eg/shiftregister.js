const {Board, ShiftRegister} = require("../lib/johnny-five");
const board = new Board();

// This works with the 74HC595 that comes with the SparkFun Inventor's kit.
// Your mileage may vary with other chips. For more information on working
// with shift registers, see http://arduino.cc/en/Tutorial/ShiftOut

board.on("ready", () => {
  const register = new ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  let value = 0b00000000;
  let upper = 0b10001000;
  let lower = 0b00010001;

  function next() {
    register.send(value = value > lower ? value >> 1 : upper);
    setTimeout(next, 200);
  }

  next();
});
