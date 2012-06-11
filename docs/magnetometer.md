# Magnetometer

```javascript
var five = require("johnny-five"),
    mag;

five.Board().on("ready", function() {

  // Create a new `Magnetometer` hardware instance.
  //
  // five.Magnetometer();
  //
  // (which is an alias of:
  //   new five.Compass({
  //    device: "HMC5883L",
  //    freq: 50,
  //    gauss: 1.3
  //   });
  // )
  //

  mag = new five.Magnetometer();


  // Properties

  // mag.axis
  //
  // x, y, z
  //

  // mag.scaled
  //
  // scaled x, y, z
  //
  // based on value stored at (mag.scale)
  //

  // mag.heading
  //
  // Calculated heading degrees (calibrated for magnetic north)
  //


  // Magnetometer Event API

  // "headingchange"
  //
  // Fires when the calculated heading has changed
  //
  mag.on("headingchange", function() {

    console.log( "headingchange", Math.floor(this.heading) );

  });

  // "read"
  //
  // Fires continuously, every 66ms.
  //
  mag.on("read", function( err, timestamp ) {
    // console.log( "read", this.axis );
  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/magnetometer.png">

[magnetometer.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/magnetometer.fzz)


## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
