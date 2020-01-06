<!--remove-start-->

# Servo - Multi-Turn

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/servo-multi-turn.js
```


```javascript
const {Board, Servo} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const servo = new Servo({
    pin: 10,
    // Cheapo servo has limited PWM range
    pwmRange: [600, 2370],
    // This multi-turn servo can turn 2430 degrees or 6.75 revolutions
    deviceRange: [0, 2430]
  });

  // Add servo to REPL (optional)
  board.repl.inject({
    servo
  });


  // Servo API

  // min()
  //
  // move the servo to its minimum position
  //
  // eg. servo.min();

  // max()
  //
  // move the servo to its maximum position of 6.75 turns from the minimum
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo at 3 3/8 turns from the minimum
  //
  // servo.center();

  // to( deg )
  //
  // Moves the servo to 2 whole turns from the minimum
  //
  // servo.to( 720 );

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
