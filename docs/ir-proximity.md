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

    console.log("motionstart");

  });

  // "motionend"
  //
  // Fires when the proximal area is has been cleared
  // of obstruction.

  ir.on("motionend", function() {

    console.log("motionend");

  });

  // "data"
  //
  // Fires continuously, every 66ms.
  //
  ir.on("data", function(err, timestamp) {
    // console.log( "data" );
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
