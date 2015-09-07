var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var motors = new five.Motors([
    { controller: "EVS_EV3", pin: "BAM1" },
    { controller: "EVS_EV3", pin: "BBM1" },
  ]);

  this.wait(2000, function() {
    motors.rev();

    this.wait(2000, function() {
      motors.stop();
    });
  });

  motors.fwd();
});
