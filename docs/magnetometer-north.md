<!--remove-start-->

# Compass - Find north

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/magnetometer-north.js
```


```javascript
var chalk = require("chalk"),
  five = require("johnny-five"),
  board, servo, mag, count, dirs, isNorth, isSeeking, last;

board = new five.Board();

board.on("ready", function() {

  count = -1;
  dirs = ["cw", "ccw"];
  isNorth = false;
  isSeeking = false;

  [
    [95, "ccw"],
    [85, "cw"]

  ].forEach(function(def) {
    five.Servo.prototype[def[1]] = function() {
      this.to(def[0]);
    };
  });


  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 9,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous"
  });


  // Create an I2C `Magnetometer` instance
  mag = new five.Magnetometer();

  this.repl.inject({
    servo: servo,
    mag: mag
  });

  // set the continuous servo to stopped
  servo.to(90);

  // As the heading changes, log heading value
  mag.on("data", function() {
    var heading = Math.floor(this.heading);

    if (heading > 345 || heading < 15) {

      if (!isNorth) {
        console.log("FOUND north!".yellow);
        isSeeking = false;
      }

      isNorth = true;
      servo.stop();

    } else {
      isNorth = false;

      if (!isSeeking) {
        console.log(chalk.red("find north!"), heading);
        isSeeking = true;
      }


      if (heading < 270) {
        servo.ccw();
      } else {
        servo.cw();
      }
    }
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
