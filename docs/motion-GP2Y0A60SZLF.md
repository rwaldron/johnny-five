<!--remove-start-->

# Motion - GP2Y0A60SZLF



Run with:
```bash
node eg/motion-GP2Y0A60SZLF.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `motion` hardware instance.
  var motion = new five.Motion({
    controller: "GP2Y0A60SZLF",
    pin: "A0"
  });

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", function() {
    console.log("calibrated");
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", function() {
    console.log("motionstart");
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", function() {
    console.log("motionend");
  });
});

```


## Illustrations / Photos


### Motion - GP2Y0A60SZLF


Basic GP2Y0D815Z0F motion detection.


![docs/breadboard/GP2Y0D810Z0F.png](breadboard/GP2Y0D810Z0F.png)<br>

Fritzing diagram: [docs/breadboard/GP2Y0D810Z0F.fzz](breadboard/GP2Y0D810Z0F.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
