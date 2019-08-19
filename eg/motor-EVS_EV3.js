const {Board, Motor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const motor = new Motor({
    controller: "EVS_EV3",
    pin: "BBM2",
  });

  board.wait(2000, () => {
    console.log("REVERSE");

    motor.rev();

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, motor.stop);
  });

  console.log("FORWARD");
  motor.fwd();
});
