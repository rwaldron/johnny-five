# Servo Tutorial

Run with:
```bash
node eg/servo-tutorial.js
```


```javascript
var five = require("johnny-five"),
  board, servo;

board = new five.Board();

board.on("ready", function() {

  five.Servo({
    pin: 9,
    // Limit this servo to 170°
    range: [45, 135]
  });

  five.Servo(10);


  servo = new five.Servos();

  // You can add any objects to the board's REPL,
  // Let's add the servo here, so we can control
  // it directly from the REPL!
  board.repl.inject({
    servo: servo
  });
  //
  //
  servo.max();
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
