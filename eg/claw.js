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


// @markdown
//
// - [Robotic Claw](https://www.sparkfun.com/products/11524)
// - [Robotic Claw Pan/Tilt](https://www.sparkfun.com/products/11674)
// - [Robotic Claw Assembly](https://www.sparkfun.com/tutorials/258)
//
// ![Robotic Claw](https://cdn.sparkfun.com//assets/parts/7/4/4/4/11524-01a.jpg)
// ![Robotic Claw Pan/Tilt](https://cdn.sparkfun.com//assets/parts/7/7/6/7/11674-02.jpg)
//
// @markdown
