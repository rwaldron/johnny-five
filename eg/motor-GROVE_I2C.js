const {Board, Motor} = require("../lib/johnny-five.js");
const board = new Board();
const controller = "GROVE_I2C_MOTOR_DRIVER";

board.on("ready", () => {
  const a = new Motor({
    controller,
    pin: "A",
  });

  const b = new Motor({
    controller,
    pin: "B",
  });

  this.wait(3000, () => {
    console.log("REVERSE");

    a.rev(127);
    b.rev(127);

    // Demonstrate motor stop in 2 seconds
    this.wait(3000, () => {
      console.log("STOP");
      a.stop();
      b.stop();

      board.wait(1000, () => process.emit("SIGINT"));
    });
  });

  console.log("FORWARD");
  a.fwd(127);
  b.fwd(127);
});

/* @markdown
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)


![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

(Or similiar Grove shield and platform)

![Grove - I2C Motor Driver](http://www.seeedstudio.com/depot/images/product/12Cmotor_01.jpg)

@markdown */
