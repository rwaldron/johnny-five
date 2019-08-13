var five = require("../lib/johnny-five.js");
var dualShock = require("dualshock-controller");

var board = new five.Board();
var controller = dualShock({
  config: "dualShock3",
  analogStickSmoothing: false
});

board.on("ready", function() {

  var esc = new five.ESC(9);
  var speed = 0;
  var last = null;

  controller.on("connected", function() {
    controller.isConnected = true;
  });

  controller.on("dpadUp:press", function() {
    if (last !== "up") {
      speed = 0;
    } else {
      speed += 1;
    }
    esc.throttle(esc.neutral + speed);
    last = "up"
  });

  controller.on("dpadDown:press", function() {
    if (last !== "down") {
      speed = 0;
    } else {
      speed += 1;
    }
    esc.throttle(esc.neutral - speed);
    last = "down"
  });

  controller.on("circle:press", function() {
    last = null;
    speed = 0;
    esc.brake();
  });

  controller.on("right:move", function(position) {
    var y = five.Fn.scale(position.y, 255, 0, 0, 180) | 0;

    if (y > 100) {
      // from the deadzone and up
      esc.throttle(scale(y, 100, 180, 0, 100));
    }
  });

  controller.connect();
});


// Brushless motor breadboard diagram originally published here:
// http://robotic-controls.com/learn/projects/dji-esc-and-brushless-motor
