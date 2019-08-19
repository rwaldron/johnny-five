var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var motors = new five.Motors([{
    controller: "EVS_EV3",
    pin: "BAM1"
  }, {
    controller: "EVS_EV3",
    pin: "BBM1"
  }, ]);

  board.wait(2000, () => {
    motors.rev();

    board.wait(2000, motors.stop);
  });

  motors.fwd();
});
