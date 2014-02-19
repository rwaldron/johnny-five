var five = require("../lib/johnny-five.js");
var keypress = require("keypress");

var board = new five.Board();

board.on("ready", function() {

  var esc = new five.ESC(12);

  // Initialize the ESCs speed to 0
  esc.to(0);

  // Hold shift+arrow-up, shift+arrow-down to incrementally
  // increase or decrease speed.

  function controller(ch, key) {
    var isThrottle = false;
    var speed = esc.last ? esc.speed : 0;

    if (key && key.shift) {
      if (key.name === "up") {
        speed += 1;
        isThrottle = true;
      }

      if (key.name === "down") {
        speed -= 1;
        isThrottle = true;
      }

      if (isThrottle) {
        esc.to(speed);
      }
    }
  }

  this.repl.inject({
    esc: esc
  });


  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

// Brushless motor breadboard diagram originally published here:
// http://robotic-controls.com/learn/projects/dji-esc-and-brushless-motor
