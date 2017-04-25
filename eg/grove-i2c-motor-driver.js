var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var a = new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    pin: "A",
  });

  var b = new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    pin: "B",
  });


  this.wait(3000, function() {
    console.log("REVERSE");

    a.rev(127);
    b.rev(127);

    // Demonstrate motor stop in 2 seconds
    this.wait(3000, function() {
      console.log("STOP");
      a.stop();
      b.stop();

      this.wait(1000, function() {
        process.emit("SIGINT");
      });
    }.bind(this));
  }.bind(this));

  console.log("FORWARD");
  a.fwd(127);
  b.fwd(127);
});

/* @markdown
For this program, you'll need:

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

(Or similiar Grove shield and platform)

![Grove - I2C Motor Driver](http://www.seeedstudio.com/depot/images/product/12Cmotor_01.jpg)

@markdown */
