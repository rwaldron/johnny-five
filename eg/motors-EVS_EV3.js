const {Board, Motors} = require("../lib/johnny-five.js");
const board = new Board();
const controller = "EVS_EV3";

board.on("ready", () => {
  const motors = new Motors([{
    controller,
    pin: "BAM1"
  }, {
    controller,
    pin: "BBM1"
  }, ]);

  board.wait(2000, () => {
    motors.rev();

    board.wait(2000, motors.stop);
  });

  motors.fwd();
});
