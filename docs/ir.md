# Ir

```javascript
var five = require("johnny-five"),
    ir;

five.Board().on("ready", function() {

  // Create a new `Proximity` hardware instance.
  //
  // five.Proximity();
  //
  // (Alias of:
  //   new five.IR({
  //    device: "GP2Y0D805Z0F",
  //    freq: 50
  //   });
  // )
  //

  ir = new five.IR();


  // Properties

  // ir.axis
  //
  // x, y, z
  //

  // ir.scaled
  //
  // scaled x, y, z
  //
  // based on value stored at (ir.scale)
  //

  // ir.heading
  //
  // Calculated heading degrees (calibrated for irnetic north)
  //


  // Magnetometer Event API

  // "headingchange"
  //
  // Fires when the calculated heading has changed
  //
  ir.on("headingchange", function() {

    console.log( "headingchange", Math.floor(this.heading) );

  });

  // "read"
  //
  // Fires continuously, every 66ms.
  //
  ir.on("read", function( err, timestamp ) {
    console.log( "read", this.axis );
  });
});

```

## Breadboard




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
