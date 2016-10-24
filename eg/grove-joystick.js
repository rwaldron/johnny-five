var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the Joystick module into the
  // Grove Shield's A0 jack. Use
  // the Joystick class to control.
  var joystick = new five.Joystick(["A0", "A1"]);

  // Observe change events from the Joystick!
  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
    console.log("--------------------------------------");
  });
});

/* @markdown
For this program, you'll need:

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - Joystick Module](http://www.seeedstudio.com/depot/images/product/bgjoy1.jpg)

@markdown */
