<!--remove-start-->

# Servo - Continuous

<!--remove-end-->






##### Servo on pin 10


Servo connected to pin 10. Requires servo on pin that supports PWM (usually denoted by ~).


![docs/breadboard/servo.png](breadboard/servo.png)<br>

Fritzing diagram: [docs/breadboard/servo.fzz](breadboard/servo.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/servo-continuous.js
```


```javascript
var five = require("johnny-five");
var keypress = require("keypress");

keypress(process.stdin);

var board = new five.Board();

board.on("ready", function() {

  console.log("Use Up and Down arrows for CW and CCW respectively. Space to stop.");

  var servo = new five.Servo.Continuous(10);

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.setRawMode(true);

  process.stdin.on("keypress", function(ch, key) {

    if (!key) {
      return;
    }

    if (key.name === "q") {
      console.log("Quitting");
      process.exit();
    } else if (key.name === "up") {
      console.log("CW");
      servo.cw();
    } else if (key.name === "down") {
      console.log("CCW");
      servo.ccw();
    } else if (key.name === "space") {
      console.log("Stopping");
      servo.stop();
    }
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
