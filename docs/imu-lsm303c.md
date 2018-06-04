<!--remove-start-->

# IMU - LSM303C

<!--remove-end-->






##### Breadboard for "IMU - LSM303C"



![docs/breadboard/imu-lsm303c.png](breadboard/imu-lsm303c.png)<br>

Fritzing diagram: [docs/breadboard/imu-lsm303c.fzz](breadboard/imu-lsm303c.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/imu-lsm303c.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {

  // Hookup Guide
  // https://learn.sparkfun.com/tutorials/lsm303c-6dof-hookup-guide#hardware-assembly
  //
  // Basically uses I2C, so only 4 pins are needed:
  // VCC --> VDD
  // GND --> GND
  // SCL --> SCL
  // SDA --> SDA

  var layout = `
  Board layout:
       +---------------+
       |              *| GND
       |              *| VDD_IO
       |              *| SDA
       |              *| SCL
       |              *| INT_XL
       |              *| DRYM
       |              *| CS_XL
       |              *| VDD
       |              *| CS_MAG
       |              *| INT_MAG
       +---------------+
  `;

  console.log(layout);

  var imu = new five.IMU({
    controller: "LSM303C"
  });

  imu.on("change", function() {

    if (Math.random() > 0.05) {
      return;
    }

    if (this.accelerometer) {
      console.log("Accelerometer");
      console.log("  x            : ", this.accelerometer.x);
      console.log("  y            : ", this.accelerometer.y);
      console.log("  z            : ", this.accelerometer.z);
      console.log("  pitch        : ", this.accelerometer.pitch);
      console.log("  roll         : ", this.accelerometer.roll);
      console.log("  acceleration : ", this.accelerometer.acceleration);
      console.log("  inclination  : ", this.accelerometer.inclination);
      console.log("  orientation  : ", this.accelerometer.orientation);
      console.log("--------------------------------------");
    }

    if (this.magnetometer) {
      console.log("magnetometer");
      console.log("  heading : ", Math.floor(this.magnetometer.heading));
      console.log("  bearing : ", this.magnetometer.bearing.name);
      console.log("  x            : ", this.magnetometer.raw.x);
      console.log("  y            : ", this.magnetometer.raw.y);
      console.log("  z            : ", this.magnetometer.raw.z);
      console.log("--------------------------------------");
    }

    if (this.thermometer) {
      console.log("Thermometer");
      console.log("  celsius      : ", this.thermometer.celsius);
      console.log("  fahrenheit   : ", this.thermometer.fahrenheit);
      console.log("--------------------------------------");
    }
    console.log("");
    console.log("");
    console.log("");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
