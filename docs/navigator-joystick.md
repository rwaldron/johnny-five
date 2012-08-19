# Navigator Joystick

Run with:
```bash
node eg/navigator-joystick.js
```


```javascript
var five = require("johnny-five"),
    when = require("when"),
    boards, readyList, joystick, led, servo;

boards = {};
readyList = [];

[ "navigator", "controller" ].forEach(function( name ) {
  var deferred = when.defer();

  readyList.push( deferred.promise );

  (
    boards[ name ] = new five.Board({ id: name })
  ).on( "ready", function() {

    deferred.resolve( this );
  });
});

when.all( readyList, function() {
  // console.log( "resolved" );
  var last, dirs, turn;

  joystick = new five.Joystick({
    board: boards.controller,
    pins: [ "A0", "A1" ],
    freq: 100
  });

  led = new five.Led({
    board: boards.navigator,
    pin: 13
  });

  servo = new five.Servo({
    board: boards.navigator,
    pin: 12,
    range: [ 10, 170 ]
  });

  last = 1;
  dirs = [ "left", undefined, "right" ];
  turn = [ "max", "center", "min" ];

  servo.center();

  joystick.on("axismove", function() {
    // 0: left, 1: center, 2: right
    var position = Math.ceil(2 * this.fixed.x);

    // console.log( position );

    // If the joystick has actually moved and it's
    // not in the center...
    if ( last !== position ) {
      last = position;

      if ( position !== 1 ) {
        console.log( dirs[ position ] );
      }


      servo[ turn[ position ] ]();
    }
  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/navigator-joystick.png">

[navigator-joystick.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/navigator-joystick.fzz)



## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
