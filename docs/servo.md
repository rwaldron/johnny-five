# Servo

Run with:
```bash
node eg/servo.js
```


```javascript
var five = require("johnny-five"),
    board, servo;

board = new five.Board();

board.on("ready", function() {

  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 10,
    startAt: 90, // Immediately moves to this degree on startup
    range: [0, 180] // The range defaults to 0-180 degrees
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo
  });

  // Servo API

  // min()
  //
  // set the servo to the minimum degrees
  // defaults to 0
  //
  // eg. servo.min();

  // max()
  //
  // set the servo to the maximum degrees
  // defaults to 180
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo to 90°
  //
  // servo.center();

  // move( deg )
  //
  // Moves the servo to position by degrees
  //
  // servo.move( 90 );

  // sweep( obj )
  //
  // Perform a min-max cycling servo sweep (defaults to 0-180)
  // optionally accepts an object of sweep settings:
  // {
  //    lapse: time in milliseconds to wait between moves
  //           defaults to 500ms
  //    degrees: distance in degrees to move
  //           defaults to 10°
  // }
  //
  // servo.sweep();


  // Servo Event API

  // "move" events fire after a successful move.
  servo.on("move", function( err, degrees ) {
    console.log( "move", degrees );
  });
});


// References
//
// http://servocity.com/html/hs-7980th_servo.html

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/servo.png">

[docs/breadboard/servo.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/servo.fzz)



## Devices




## Documentation

The constructor takes either a pin number or an options object.



## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
