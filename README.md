# Johnny 5, is in progress.

### [Firmata](https://github.com/jgautier/firmata) powered Arduino programming framework. "Node-isassemble Stephanie!"

### [Joystick Controlled Claw](http://jsfiddle.net/rwaldron/6ZXFe/show/light/)
### [Robot Claw Video](http://jsfiddle.net/rwaldron/CFSZJ/show/light/)
### [Joystick, Motor & Led Video](http://jsfiddle.net/rwaldron/gADSz/show/light/)

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
    pin: 9
  });

  led.strobe( 100 );
});
```

## Example Programs

- [Board](https://github.com/rwldrn/johnny-five/blob/master/docs/board.md)
- [Button Options](https://github.com/rwldrn/johnny-five/blob/master/docs/button-options.md)
- [Button](https://github.com/rwldrn/johnny-five/blob/master/docs/button.md)
- [Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/claw.md)
- [Continuous](https://github.com/rwldrn/johnny-five/blob/master/docs/continuous.md)
- [Joystick Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-claw.md)
- [Joystick Motor Led](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-motor-led.md)
- [Joystick](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick.md)
- [Led Fade](https://github.com/rwldrn/johnny-five/blob/master/docs/led-fade.md)
- [Led On Off](https://github.com/rwldrn/johnny-five/blob/master/docs/led-on-off.md)
- [Led Strobe](https://github.com/rwldrn/johnny-five/blob/master/docs/led-strobe.md)
- [Motor](https://github.com/rwldrn/johnny-five/blob/master/docs/motor.md)
- [Piezo](https://github.com/rwldrn/johnny-five/blob/master/docs/piezo.md)
- [Ping](https://github.com/rwldrn/johnny-five/blob/master/docs/ping.md)
- [Pir](https://github.com/rwldrn/johnny-five/blob/master/docs/pir.md)
- [Potentiometer](https://github.com/rwldrn/johnny-five/blob/master/docs/potentiometer.md)
- [Repl](https://github.com/rwldrn/johnny-five/blob/master/docs/repl.md)
- [Sensor](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor.md)
- [Servo Array](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-array.md)
- [Servo Dual](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-dual.md)
- [Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/servo.md)
- [Sonar](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar.md)
- [Switch](https://github.com/rwldrn/johnny-five/blob/master/docs/switch.md)


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
