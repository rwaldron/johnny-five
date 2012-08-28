<img src="https://github.com/rwldrn/johnny-five/raw/master/assets/sgier-johnny-five.png">

# Node-isassemble Johnny-Five


### [Firmata](https://github.com/jgautier/firmata) & [SerialPort](https://github.com/voodootikigod/node-serialport) powered JavaScript Arduino programming framework.

### Why JavaScript? [NodeBots: The Rise of JavaScript Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics)

### Johnny-Five artwork by [Mike Sgier](http://msgierillustration.com)



## Many fragments. Some large, some small.


### [Biped Nodebot](http://jsfiddle.net/rwaldron/WZkn5/show/light/) NEW!
### [Slider Controlled Panning Servo](http://jsfiddle.net/rwaldron/kZakv/show/light/)
### [Joystick Controlled Laser (pan/tilt) 1](http://jsfiddle.net/rwaldron/HPqms/show/light/)
### [Joystick Controlled Laser (pan/tilt) 2](http://jsfiddle.net/rwaldron/YHb7A/show/light/)
### [Joystick Controlled Claw](http://jsfiddle.net/rwaldron/6ZXFe/show/light/)
### [Robot Claw](http://jsfiddle.net/rwaldron/CFSZJ/show/light/)
### [Joystick, Motor & Led](http://jsfiddle.net/rwaldron/gADSz/show/light/)



## Setup and Assemble Arduino

- Recommended Starting Kit: [Sparkfun Inventor's Kit](https://www.sparkfun.com/products/11022)
- Download Arduino IDE
  - [OSX](http://arduino.googlecode.com/files/arduino-1.0.1-macosx.zip)
  - [Linux 32 bit](http://arduino.googlecode.com/files/arduino-1.0.1-linux.tgz)
  - [Linux 64 bit](http://arduino.googlecode.com/files/arduino-1.0.1-linux64.tgz)
  - Windows support coming soon.
- Plug in your Arduino or Arduino compatible microcontroller via USB
- Open the Arduino IDE, select: File > Examples > Firmata > StandardFirmata
  - Make sure that the version of Firmata is [2.2](http://at.or.at/hans/pd/Firmata-2.2.zip). There are known issues with 2.3
- Click the "Upload" button.

If the upload was successful, the board is now prepared and you can close the Arduino IDE.


**Attention** There is a known issue in where the Firmata protocol layer has issues freeing itself on the serial line which results in the program hanging in when it tries to connect. For now, the only way to get around the issue is to send a SIGINT ` ^C ` to kill the hanging program and simply run it again.


## Hey you, here's Johnny!

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


## Johnny-Five is...


```javascript
var five = require("johnny-five"),
    // or "./lib/johnny-five" when running from the source
    board = new five.Board();

board.on("ready", function() {

  // Create an Led on pin 13 and strobe it on/off
  // Optionally set the speed; defaults to 100ms
  (new five.Led(13)).strobe();

});
```

#### [Watch it here!](http://jsfiddle.net/rwaldron/dtudh/show/light)


## More Input

- [Accelerometer Pan Tilt](https://github.com/rwldrn/johnny-five/blob/master/docs/accelerometer-pan-tilt.md)
- [Accelerometer](https://github.com/rwldrn/johnny-five/blob/master/docs/accelerometer.md)
- [Board Multi](https://github.com/rwldrn/johnny-five/blob/master/docs/board-multi.md)
- [Board](https://github.com/rwldrn/johnny-five/blob/master/docs/board.md)
- [Boe Test Servos](https://github.com/rwldrn/johnny-five/blob/master/docs/boe-test-servos.md)
- [Bug](https://github.com/rwldrn/johnny-five/blob/master/docs/bug.md)
- [Button Bumper](https://github.com/rwldrn/johnny-five/blob/master/docs/button-bumper.md)
- [Button Options](https://github.com/rwldrn/johnny-five/blob/master/docs/button-options.md)
- [Button](https://github.com/rwldrn/johnny-five/blob/master/docs/button.md)
- [Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/claw.md)
- [Continuous Clock](https://github.com/rwldrn/johnny-five/blob/master/docs/continuous-clock.md)
- [Continuous](https://github.com/rwldrn/johnny-five/blob/master/docs/continuous.md)
- [Ed](https://github.com/rwldrn/johnny-five/blob/master/docs/ed.md)
- [Gripper](https://github.com/rwldrn/johnny-five/blob/master/docs/gripper.md)
- [Ir Motion](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-motion.md)
- [Ir Proximity](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-proximity.md)
- [Ir Reflect](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-reflect.md)
- [Joystick Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-claw.md)
- [Joystick Laser](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-laser.md)
- [Joystick Motor Led](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-motor-led.md)
- [Joystick](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick.md)
- [Laser](https://github.com/rwldrn/johnny-five/blob/master/docs/laser.md)
- [Lcd Enumeratechars](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd-enumeratechars.md)
- [Lcd Runner 20x4](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd-runner-20x4.md)
- [Lcd Runner](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd-runner.md)
- [Lcd Usechar](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd-usechar.md)
- [Lcd](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd.md)
- [Led Fade](https://github.com/rwldrn/johnny-five/blob/master/docs/led-fade.md)
- [Led On Off](https://github.com/rwldrn/johnny-five/blob/master/docs/led-on-off.md)
- [Led Pulse](https://github.com/rwldrn/johnny-five/blob/master/docs/led-pulse.md)
- [Led Rgb](https://github.com/rwldrn/johnny-five/blob/master/docs/led-rgb.md)
- [Led Strobe](https://github.com/rwldrn/johnny-five/blob/master/docs/led-strobe.md)
- [Magnetometer Log](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer-log.md)
- [Magnetometer North](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer-north.md)
- [Magnetometer](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer.md)
- [Motor](https://github.com/rwldrn/johnny-five/blob/master/docs/motor.md)
- [Navigator Joystick](https://github.com/rwldrn/johnny-five/blob/master/docs/navigator-joystick.md)
- [Navigator Original](https://github.com/rwldrn/johnny-five/blob/master/docs/navigator-original.md)
- [Navigator](https://github.com/rwldrn/johnny-five/blob/master/docs/navigator.md)
- [Nodeconf Compass](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-compass.md)
- [Nodeconf Navigator](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-navigator.md)
- [Nodeconf Radar](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-radar.md)
- [Nodeconf Slider](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-slider.md)
- [Nunchuk](https://github.com/rwldrn/johnny-five/blob/master/docs/nunchuk.md)
- [Piezo](https://github.com/rwldrn/johnny-five/blob/master/docs/piezo.md)
- [Photoresistor](https://github.com/rwldrn/johnny-five/blob/master/docs/photoresistor.md)
- [Ping](https://github.com/rwldrn/johnny-five/blob/master/docs/ping.md)
- [Potentiometer](https://github.com/rwldrn/johnny-five/blob/master/docs/potentiometer.md)
- [Proximity](https://github.com/rwldrn/johnny-five/blob/master/docs/proximity.md)
- [Radar Client](https://github.com/rwldrn/johnny-five/blob/master/docs/radar-client.md)
- [Radar](https://github.com/rwldrn/johnny-five/blob/master/docs/radar.md)
- [Repl](https://github.com/rwldrn/johnny-five/blob/master/docs/repl.md)
- [Sensor Fsr Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-fsr-servo.md)
- [Sensor Fsr](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-fsr.md)
- [Sensor Ir Led Receiver](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-ir-led-receiver.md)
- [Sensor Slider](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-slider.md)
- [Sensor](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor.md)
- [Servo Array](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-array.md)
- [Servo Diagnostic](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-diagnostic.md)
- [Servo Digital](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-digital.md)
- [Servo Dual](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-dual.md)
- [Servo Tutorial](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-tutorial.md)
- [Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/servo.md)
- [Shiftregister](https://github.com/rwldrn/johnny-five/blob/master/docs/shiftregister.md)
- [Slider Log](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-log.md)
- [Slider Pan](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-pan.md)
- [Slider Servo Control](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-servo-control.md)
- [Sonar Scan](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar-scan.md)
- [Sonar](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar.md)




## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
