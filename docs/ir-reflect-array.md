<!--remove-start-->

# IR Reflectance Array

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/ir-reflect-array.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var calibrating = true;
  var eyes = new five.IR.Reflect.Collection({
    emitter: 13,
    pins: ["A0", "A1", "A2", "A3", "A4", "A5"]
  });

  // calibrate for two seconds
  eyes.calibrateUntil(function() {
    return !calibrating;
  });
  setTimeout(function() {
    calibrating = false;
  }, 2000);

  eyes.enable();

  // "line"
  //
  // Fires continuously once calibrated
  //
  eyes.on("line", function(line) {
    console.log("line: ", line);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
