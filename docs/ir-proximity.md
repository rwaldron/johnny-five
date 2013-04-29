# Ir Proximity

Run with:
```bash
node eg/ir-proximity.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  // Create a new `IR.Proximity` hardware instance.
  //
  // five.IR.Proximity();
  //
  // (Alias of:
  //   new five.IR({
  //    device: "GP2Y0D805Z0F",
  //    freq: 50
  //   });
  // )
  //

  var ir = new five.IR.Proximity();


  // IR.Proximity Event API

  // "motionstart"
  //
  // Fires when the proximal area is disrupted,
  // generally by some form of movement

  ir.on("motionstart", function() {

    console.log( "motionstart" );

  });

  // "motionend"
  //
  // Fires when the proximal area is has been cleared
  // of obstruction.

  ir.on("motionend", function() {

    console.log( "motionend" );

  });

  // "read"
  //
  // Fires continuously, every 66ms.
  //
  ir.on("read", function( err, timestamp ) {
    // console.log( "read" );
  });
});

```

## Breadboard/Illustration





## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
