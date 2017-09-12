<!--remove-start-->

# Servo - Multi-Turn

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/servo-multi-turn.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo({
    pin: 10,
    pwmRange: [600, 2370], // Cheapo servo has limited PWM range
    deviceRange: [0, 2430] // This multi-turn servo can turn 2430 degrees or 6.75 revolutions
  });

  // Add servo to REPL (optional)
  this.repl.inject({
    servo: servo
  });


  // Servo API

  // min()
  //
  // set the servo to the minimum degrees
  //
  // eg. servo.min();

  // max()
  //
  // set the servo to the maximum degrees
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo
  //
  // servo.center();

  // to( deg )
  //
  // Moves the servo to position by degrees
  //
  // servo.to( 90 );

});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
