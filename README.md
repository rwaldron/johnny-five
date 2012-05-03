# Johnny 5, is in progress.

### [Firmata](https://github.com/jgautier/firmata) powered Arduino programming framework. "Node-isassemble Stephanie!"

### [Joystick Controlled Laser (pan/tilt) 1](http://jsfiddle.net/rwaldron/HPqms/show/light/)
### [Joystick Controlled Laser (pan/tilt) 2](http://jsfiddle.net/rwaldron/YHb7A/show/light/)
### [Joystick Controlled Claw](http://jsfiddle.net/rwaldron/6ZXFe/show/light/)
### [Robot Claw Video](http://jsfiddle.net/rwaldron/CFSZJ/show/light/)
### [Joystick, Motor & Led Video](http://jsfiddle.net/rwaldron/gADSz/show/light/)

## Getting Started

### Preparing the Arduino

- Download and open the [Arduino IDE](http://arduino.cc/hu/Main/Software)
- Plug in your Arduino or Arduino compatible microcontroller via USB
- From the IDE, select: File > Examples > Firmate > StandardFirmata
- Click the "Upload" button.

If the upload was successful, the board is now prepared and you can close the Arduino IDE.


### Getting Johnny Five:

#### Source Code:

``` bash
git clone git://github.com/rwldrn/johnny-five.git && cd johnny-five

npm install
```

#### npm package:

Install the module with:

```bash
npm install johnny-five
```


### A Simple Program


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

## Example Programs

- [Board](https://github.com/rwldrn/johnny-five/blob/master/docs/board.md)
- [Button Options](https://github.com/rwldrn/johnny-five/blob/master/docs/button-options.md)
- [Button](https://github.com/rwldrn/johnny-five/blob/master/docs/button.md)
- [Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/claw.md)
- [Continuous](https://github.com/rwldrn/johnny-five/blob/master/docs/continuous.md)
- [Joystick Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-claw.md)
- [Joystick Laser](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-laser.md)
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
