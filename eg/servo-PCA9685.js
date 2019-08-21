const {Board, Servo} = require("../lib/johnny-five.js");
const board = new Board();
const controller = "PCA9685";

board.on("ready", () => {
  console.log("Connected");

  // Initialize the servo instance
  const a = new Servo({
    controller,
    pin: 0,
  });

  const b = new Servo({
    controller,
    range: [0, 180],
    pin: 1,
  });

  a.to(0);
  b.to(0);
  
});
