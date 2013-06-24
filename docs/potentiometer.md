# Potentiometer

Run with:
```bash
node eg/potentiometer.js
```


```javascript
var five = require("johnny-five"),
    board, potentiometer;

board = new five.Board();

board.on("ready", function() {

  // Create a new `potentiometer` hardware instance.
  potentiometer = new five.Sensor({
    pin: "A2",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: potentiometer
  });

  // "read" get the current reading from the potentiometer
  potentiometer.on("read", function( err, value ) {
    console.log( value, this.normalized );
  });
});


// References
//
// http://arduino.cc/en/Tutorial/AnalogInput

```

## Breadboard/Illustration

![docs/breadboard/potentiometer.png](breadboard/potentiometer.png)
[docs/breadboard/potentiometer.fzz](breadboard/potentiometer.fzz)



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
