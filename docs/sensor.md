<!--remove-start-->

# Sensor



Run with:
```bash
node eg/sensor.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `sensor` hardware instance.
  var sensor = new five.Sensor({
    pin: "A0",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  this.repl.inject({
    sensor: sensor
  });

  // Properties

  // sensor.scaled
  //
  // Current value of a sensor, scaled to a value
  // between the lower and upper bound set by calling
  // scale( low, high ).
  //
  // Defaults to value between 0-255
  //


  // Sensor Event API

  // "data"
  //
  // Fires when the pin is read for a value
  //
  sensor.scale([0, 100]).on("data", function() {
    console.log(this.value, this.raw);
  });

  // "change"
  //
  // Aliases: "bend", "force", "slide", "touch"
  //
  // Fires when value of sensor changes
  //
});

// Tutorials
//
// http://protolab.pbworks.com/w/page/19403657/TutorialSensors
// http://www.dfrobot.com/wiki/index.php?title=Analog_Slide_Position_Sensor_(SKU:_DFR0053)

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
