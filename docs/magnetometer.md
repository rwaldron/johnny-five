# Magnetometer

Run with:
```bash
node eg/magnetometer.js
```


```javascript
var five = require("johnny-five"),
  mag;

five.Board().on("ready", function() {

  // Create a new `Magnetometer` hardware instance.
  //
  // five.Magnetometer();
  //
  // (Alias of:
  //   new five.Compass({
  //    device: "HMC5883L",
  //    freq: 50,
  //    gauss: 1.3
  //   });
  // )
  //

  mag = new five.Magnetometer();


  // Properties

  // mag.raw
  //
  // x, y, z
  //

  // mag.scaled
  //
  // axis x, y, z
  //
  // based on value stored at (mag.scale)
  //

  // mag.heading
  //
  // Calculated heading in degrees (calibrated for magnetic north)
  //

  // mag.bearing
  //
  // Bearing data object
  //


  // Magnetometer Event API

  // "headingchange"
  //
  // Fires when the calculated heading has changed
  //
  mag.on("headingchange", function() {

    console.log("heading", Math.floor(this.heading));
    console.log("bearing", this.bearing);

  });

  // "read"
  //
  // Fires continuously, every 66ms.
  //
  mag.on("read", function(err, timestamp) {
    // console.log( "read", this.axis );
  });
});

```


## Breadboard/Illustration


![docs/breadboard/magnetometer.png](breadboard/magnetometer.png)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
