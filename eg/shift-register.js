const {Board, ShiftRegister} = require("../lib/johnny-five");
const board = new Board();

// For use with 74HC595 chip

board.on("ready", () => {
  const register = new ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  let value = 0;

  setInterval(() => {
    value = value > 0x11 ? value >> 1 : 0x88;
    register.send(value);
  }, 200);
});
