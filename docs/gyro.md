<!--remove-start-->

# Gyro

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/gyro.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo("O2");
  var gyro = new five.Gyro({
    pins: ["I0", "I1"],
    sensitivity: 0.67 // TK_4X
  });

  servo.center();

  var threshold = 2;
  var position = 0;
  var lapse = 0;

  var sampleTime = 10;
  var time = Date.now();

  var pitch = {
    value: 0,
    last: 0,
    angle: 0
  };

  var roll = {
    value: 0,
    last: 0,
    angle: 0
  };

  gyro.on("change", function(err, data) {
    var now = Date.now();

    console.log("X raw: %d rate: %d", this.x, this.rate.x);
    console.log("Y raw: %d rate: %d", this.y, this.rate.y);

    pitch.value = this.pitch.rate;
    roll.value = this.roll.rate;

    // Ignore the gyro if our angular velocity does not meet our threshold
    if (pitch.value >= threshold || pitch.value <= -threshold) {
      pitch.angle += ((pitch.last + pitch.value) * 10) / 1000;
    }

    if (roll.value >= threshold || roll.value <= -threshold) {
      roll.angle += ((roll.last + roll.value) * 10) / 1000;
    }

    pitch.last = pitch.value;
    roll.last = roll.value;

    if (roll.angle < 0) {
      roll.angle += 360;
    }

    if (roll.angle > 359) {
      roll.angle -= 360;
    }

    // counterclockwise rotation of the gyro...
    if (roll.angle >= 0 && roll.angle <= 90) {
      // ...produces rotation from 90 to 180 deg on servo
      position = (90 + roll) | 0;
    }

    // clockwise rotation of the gyro...
    if (roll.angle >= 270) {
      // ...produces rotation from 90 to 0 deg on servo
      position = (roll.angle - 270) | 0;
    }

    // console.log( position );
    servo.to(position);

    console.log("-----------------------------------");
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
