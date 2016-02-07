<!--remove-start-->

# IMU - BNO055

<!--remove-end-->






##### Breadboard for "IMU - BNO055"



![docs/breadboard/imu-bno055.png](breadboard/imu-bno055.png)<br>

Fritzing diagram: [docs/breadboard/imu-bno055.fzz](breadboard/imu-bno055.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/imu-bno055-orientation.js
```


```javascript
var five = require("johnny-five"),
  board;

board = new five.Board();

board.on("ready", function () {

  // Borrowed from
  // https://github.com/adafruit/Adafruit_BNO055/blob/master/examples/bunny/bunny.ino
  //
  // Calibration: https://www.youtube.com/watch?v=uH7iQrH3GpA&feature=youtu.be

  var layout = `
  Board layout:
      +----------+
      |         *| RST   PITCH  ROLL  HEADING
  ADR |*        *| SCL
  INT |*        *| SDA     ^            /->
  PS1 |*        *| GND     |            |
  PS0 |*        *| 3VO     Y    Z-->    \-X
      |         *| VIN
      +----------+
  `;

  console.log(layout);

  var imu = new five.IMU({
    controller: "BNO055",
    enableExternalCrystal: false // this can be turned on for better performance if you are using the Adafruit board
  });


  imu.orientation.on("change", function () {

    console.log("orientation");
    console.log("  w            : ", this.quarternion.w);
    console.log("  x            : ", this.quarternion.x);
    console.log("  y            : ", this.quarternion.y);
    console.log("  z            : ", this.quarternion.z);

    console.log("  heading      : ", this.euler.heading);
    console.log("  roll         : ", this.euler.roll);
    console.log("  pitch        : ", this.euler.pitch);

    console.log("--------------------------------------");

  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
