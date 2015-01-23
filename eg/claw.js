var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var claw = new five.Servo(9);
  var arm = five.Servo(10);
  var degrees = 10;
  var incrementer = 10;
  var last;

  this.loop(25, function() {

    if (degrees >= 180 || degrees === 0) {
      incrementer *= -1;
    }

    degrees += incrementer;

    if (degrees === 180) {
      if (!last || last === 90) {
        last = 180;
      } else {
        last = 90;
      }
      arm.to(last);
    }

    claw.to(degrees);
  });
});


// Claw Assembly Instructions
// http://blasphemousbits.wordpress.com/2011/11/05/sparkfun-robot-claw/
