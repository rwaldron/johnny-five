<!--remove-start-->

# IMU - BNO055

<!--remove-end-->






##### Breadboard for "IMU - BNO055"



![docs/breadboard/imu-bno055.png](breadboard/imu-bno055.png)<br>

Fritzing diagram: [docs/breadboard/imu-bno055.fzz](breadboard/imu-bno055.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/imu-bno055.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {

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
    controller: "BNO055"
  });


  imu.on("change", function() {
    console.log("temperature");
    console.log("  celsius      : ", this.thermometer.celsius);
    console.log("  fahrenheit   : ", this.thermometer.fahrenheit);
    console.log("  kelvin       : ", this.thermometer.kelvin);
    console.log("--------------------------------------");

    console.log("accelerometer");
    console.log("  x            : ", this.accelerometer.x);
    console.log("  y            : ", this.accelerometer.y);
    console.log("  z            : ", this.accelerometer.z);
    console.log("  pitch        : ", this.accelerometer.pitch);
    console.log("  roll         : ", this.accelerometer.roll);
    console.log("  acceleration : ", this.accelerometer.acceleration);
    console.log("  inclination  : ", this.accelerometer.inclination);
    console.log("  orientation  : ", this.accelerometer.orientation);
    console.log("--------------------------------------");

    console.log("gyro");
    console.log("  x            : ", this.gyro.x);
    console.log("  y            : ", this.gyro.y);
    console.log("  z            : ", this.gyro.z);
    console.log("  pitch        : ", this.gyro.pitch);
    console.log("  roll         : ", this.gyro.roll);
    console.log("  yaw          : ", this.gyro.yaw);
    console.log("  rate         : ", this.gyro.rate);
    console.log("  isCalibrated : ", this.gyro.isCalibrated);
    console.log("--------------------------------------");

    console.log("magnetometer");
    console.log("  heading : ", Math.floor(this.magnetometer.heading));
    console.log("  bearing : ", this.magnetometer.bearing.name);
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
