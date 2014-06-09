# Servo Array

Run with:
```bash
node eg/servo-array.js
```


```javascript
var five = require("johnny-five"),
  board, array;

board = new five.Board();

board.on("ready", function() {

  five.Servo({
    pin: 9,
    // Limit this servo to 170°
    range: [0, 170]
  });

  five.Servo(10);

  // Initialize a reference to all Servo instances
  // five.Servo.Array()
  // five.Servos()
  array = new five.Servos();

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    array: array
  });


  // Servo.Array API

  // center()
  //
  // centers all servos to center of range
  // defaults to 90°
  //
  // eg. array.center();

  array.center();


  // min()
  //
  // set all servos to the minimum degrees
  // defaults to 0
  //
  // eg. array.min();

  // max()
  //
  // set all servos to the maximum degrees
  // defaults to 180
  //
  // eg. array.max();

  // to( deg )
  //
  // set all servos to deg
  //
  // eg. array.to( deg );

  // stop()
  //
  // stop all servos
  //
  // eg. array.stop();

  // each( callbackFn )
  //
  // Execute callbackFn for each active servo instance
  //
  // eg.
  // array.each(function( servo, index ) {
  //
  //  `this` refers to the current servo instance
  //
  // });

});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
