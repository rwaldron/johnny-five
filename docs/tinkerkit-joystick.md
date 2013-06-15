# Tinkerkit Joystick

Run with:
```bash
node eg/tinkerkit-joystick.js
```


```javascript
var five = require("johnny-five"),
    Change = require("../eg/change.js");

new five.Board().on("ready", function() {
  // var servo = new five.Servo("O0");

  var joystick = {
    x: new five.Sensor({
      pin: "I0"
    }),
    y: new five.Sensor({
      pin: "I1"
    })
  };

  var changes = {
    x: new Change(),
    y: new Change()
  };

  var dirs = {
    x: {
      1: "left",
      3: "right"
    },
    y: {
      1: "down",
      3: "up"
    }
  };


  [ "x", "y" ].forEach(function( axis ) {
    joystick[ axis ].scale(1, 3).on("change", function() {
      var round = Math.round( this.value );

      if ( round !== 2 && changes[ axis ].isNoticeable( round ) ) {
        console.log(
          "%s changed noticeably (%d): %s", axis,  round, dirs[ axis ][ round ]
        );
      } else {
        changes[ axis ].last = round;
      }
    });
  });
});



```

## Breadboard/Illustration





## Devices

- http://www.tinkerkit.com/joystick/
- http://www.tinkerkit.com/shield/


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
