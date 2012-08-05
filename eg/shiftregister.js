var five = require("../lib/johnny-five"),
    board, lcd;

board = new five.Board();

board.on("ready", function() {
  shiftRegister = new five.ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  this.repl.inject({
    reg: shiftRegister
  });

  shiftRegister.shiftOut( 2 );
});
