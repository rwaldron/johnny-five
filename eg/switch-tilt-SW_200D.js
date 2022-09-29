const {Board, Button} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const tilt = new Button(2); // digital pin 2

  board.repl.inject({
    button: tilt
  });

  // tilt the breadboard to the right, towards to the ground pin
  tilt.on("down", () => console.log("down"));

  // tilt and hold
  tilt.on("hold", () => console.log("hold"));

  // tilt back the breadboard to the stable position
  tilt.on("up", () => console.log("up"));
});
