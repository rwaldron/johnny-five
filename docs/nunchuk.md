# Nunchuk

Run with:
```bash
node eg/nunchuk.js
```


```javascript
var five = require("johnny-five"),
    board, nunchuk;

board = new five.Board();

board.on("ready", function() {

  new five.Pin("A2").low();
  new five.Pin("A3").low();

  // Create a new `nunchuk` hardware instance.
  nunchuk = new five.Wii.Nunchuk({
    freq: 50
  });


  // Nunchuk Event API
  //

  // "read" (nunchuk)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  // nunchuk.on( "read", function( err ) {

  // });

  // "change", "axischange" (joystick)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  nunchuk.joystick.on( "change", function( err, event ) {
    console.log(
      "joystick " + event.axis,
      event.target[ event.axis ],
      event.axis, event.direction
    );
  });

  // "change", "axischange" (accelerometer)
  //
  // Fired when the accelerometer detects a change in
  // axis position.
  //
  nunchuk.accelerometer.on( "change", function( err, event ) {
    console.log(
      "accelerometer " + event.axis,
      event.target[ event.axis ],
      event.axis, event.direction
    );
  });

  // "down"
  // aliases: "press", "tap", "impact", "hit"
  //
  // Fired when any nunchuk button is "down"
  //

  // "up"
  // alias: "release"
  //
  // Fired when any nunchuk button is "up"
  //

  // "hold"
  //
  // Fired when any nunchuk button is in the "down" state for
  // a specified amount of time. Defaults to 500ms
  //
  // To specify a custom hold time, use the "holdtime"
  // option of the Nunchuk constructor.
  //


  [ "down", "up", "hold" ].forEach(function( type ) {

    nunchuk.on( type, function( err, event ) {
      console.log(
        event.target.which + " is " + type,

        { isUp: event.target.isUp,
          isDown: event.target.isDown
        }
      );
    });

  });


// Further reading
// http://media.pragprog.com/titles/msard/tinker.pdf
// http://lizarum.com/assignments/physical_computing/2008/wii_nunchuck.html
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
