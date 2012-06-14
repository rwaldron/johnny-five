# Proximity

```javascript
var five = require("johnny-five"),
    prox, led;

five.Board().on("ready", function() {

  // Create a new Osepp IR Proximity Sensor hardware instance.
  //
  // five.IR.Osepp();
  //
  // (Alias of:
  //   new five.IR({
  //    device: "GP2Y0D805Z0F",
  //    freq: 50
  //   });
  // )
  //

  prox = new five.IR.Osepp();
  led = new five.Led(13);





  // Properties

  // prox.state
  //

  // Proximity Event API

  // "motionstart"
  //
  // Fired motion is detected with 2"
  //


  // "motionend"
  //
  // Fired following a "motionstart" event
  // when no movement has occurred in X ms
  //
  prox.on("motionstart", function( err, timestamp ) {
    led.on();
  });

  prox.on("motionend", function( err, timestamp ) {
    led.off();
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
