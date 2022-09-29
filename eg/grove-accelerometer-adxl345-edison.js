const {Accelerometer, Board} = require("../lib/johnny-five");
const Edison = require("edison-io");
const board = new Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the ADXL345 Accelerometer module
  // into an I2C jack
  const accelerometer = new Accelerometer({
    controller: "ADXL345"
  });

  accelerometer.on("change", () => {
    const {acceleration, inclination, orientation, pitch, roll, x, y, z} = accelerometer;
    console.log("Accelerometer:");
    console.log("  x            : ", x);
    console.log("  y            : ", y);
    console.log("  z            : ", z);
    console.log("  pitch        : ", pitch);
    console.log("  roll         : ", roll);
    console.log("  acceleration : ", acceleration);
    console.log("  inclination  : ", inclination);
    console.log("  orientation  : ", orientation);
    console.log("--------------------------------------");
  });
});
/* @markdown
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - 3-Axis Digital Accelerometer(±16g)](http://www.seeedstudio.com/depot/images/101020054%201.jpg)


@markdown */
