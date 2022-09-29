const { Board, ESC } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const escs = new ESC.Collection([9, 10]);

  // Set the motors to their max speed
  // This might be dangerous ¯\_(ツ)_/¯
  escs.throttle(100);

  board.wait(2000, escs.brake);
});
