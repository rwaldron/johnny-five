<!--remove-start-->
# Ir Reflect Array

Run with:
```bash
node eg/ir-reflect-array.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var calibrating = true;
  var eyes = new five.IR.Reflect.Array({
    emitter: 13,
    pins: ["A0", "A1", "A2", "A3", "A4", "A5"]
  });

  // calibrate for two seconds
  eyes.calibrateUntil(function() { return !calibrating; });
  setTimeout(function() { calibrating = false; }, 2000); 

  eyes.enable();

  // "line"
  //
  // Fires continuously once calibrated
  //
  eyes.on("line", function(err, line) {
    console.log("line: ", line);
  });
});


```








<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
