# Johnny 5, is in progress.

[Firmata](https://github.com/jgautier/firmata) powered Arduino programming framework.

# [Robot Claw Video](http://jsfiddle.net/rwaldron/CFSZJ/show/light/)
# [Joystick, Motor & Led Video](http://jsfiddle.net/rwaldron/gADSz/show/light/)

## Getting Started
Install the module with: `npm install johnny-five`

```javascript
var five = require("johnny-five"),
    board, led;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  led = new five.Led({
    pin: 13
  });

  led.strobe( 100 );
});
```

## Documentation

_(Nothing yet)_


## Examples

- [Board](https://github.com/rwldrn/johnny-five/blob/master/eg/board.js)
- [Button Options](https://github.com/rwldrn/johnny-five/blob/master/eg/button-options.js)
- [Button](https://github.com/rwldrn/johnny-five/blob/master/eg/button.js)
- [Claw](https://github.com/rwldrn/johnny-five/blob/master/eg/claw.js)
- [Continuous](https://github.com/rwldrn/johnny-five/blob/master/eg/continuous.js)
- [Joystick](https://github.com/rwldrn/johnny-five/blob/master/eg/joystick.js)
- [Led Fade](https://github.com/rwldrn/johnny-five/blob/master/eg/led-fade.js)
- [Led On-Off](https://github.com/rwldrn/johnny-five/blob/master/eg/led-on-off.js)
- [Led Strobe](https://github.com/rwldrn/johnny-five/blob/master/eg/led-strobe.js)
- [Motor](https://github.com/rwldrn/johnny-five/blob/master/eg/motor.js)
- [Ping](https://github.com/rwldrn/johnny-five/blob/master/eg/ping.js)
- [Pir](https://github.com/rwldrn/johnny-five/blob/master/eg/pir.js)
- [Repl](https://github.com/rwldrn/johnny-five/blob/master/eg/repl.js)
- [Sensor](https://github.com/rwldrn/johnny-five/blob/master/eg/sensor.js)
- [Servo](https://github.com/rwldrn/johnny-five/blob/master/eg/servo.js)

## Schematics

_(Nothing yet)_



## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
