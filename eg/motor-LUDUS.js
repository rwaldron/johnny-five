var five = require("../lib/johnny-five.js");
var keypress = require("keypress");
var board = new five.Board();

board.on("ready", function() {
  var motors = new five.Motors([
    five.Motor.SHIELD_CONFIGS.SPARKFUN_LUDUS.A, // Left
    five.Motor.SHIELD_CONFIGS.SPARKFUN_LUDUS.B, // Right
  ]);
  var speed = 100;

  function controller(ch, key) {
    if (key) {
      if (key.name === "space") {
        motors.stop();
      }
      if (key.name === "up") {
        motors.fwd(speed);
      }
      if (key.name === "down") {
        motors.rev(speed);
      }
      if (key.name === "right") {
        motors[0].fwd(speed * 0.75);
        motors[1].rev(speed * 0.75);
      }
      if (key.name === "left") {
        motors[0].rev(speed * 0.75);
        motors[1].fwd(speed * 0.75);
      }
    }
  }

  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});
