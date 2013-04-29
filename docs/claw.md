# Claw

Run with:
```bash
node eg/claw.js
```


```javascript
var five = require("johnny-five"),
    board;

board = new five.Board();

board.on("ready", function() {

  var claw = new five.Servo({ pin: 9 }),
      arm =  five.Servo({ pin: 10 }),
      degrees = 10,
      incrementer = 10,
      last;

  this.loop( 25, function() {

    if ( degrees >= 180 || degrees === 0 ) {
      incrementer *= -1;
    }

    degrees += incrementer;

    if ( degrees === 180 ) {
      if ( !last || last === 90 ) {
        last = 180;
      } else {
        last = 90;
      }
      arm.move( last );
    }

    claw.move( degrees );
  });
});


// Claw Assembly Instructions
// http://blasphemousbits.wordpress.com/2011/11/05/sparkfun-robot-claw/

```

## Breadboard/Illustration





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
