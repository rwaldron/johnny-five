<img src="https://github.com/rwldrn/johnny-five/raw/master/assets/sgier-johnny-five.png">

# Node-isassemble Johnny-Five


#### [Firmata](https://github.com/jgautier/firmata) & [SerialPort](https://github.com/voodootikigod/node-serialport) powered JavaScript Arduino programming framework.

#### Why JavaScript? [NodeBots: The Rise of JavaScript Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics)

#### Johnny-Five artwork by [Mike Sgier](http://msgierillustration.com)



## Many fragments. Some large, some small.

#### [Wireless Nodebot](http://jsfiddle.net/rwaldron/88M6b/show/light) NEW!
#### [Kinect Controlled Robot Arm](http://jsfiddle.net/rwaldron/XMsGQ/show/light/) NEW!
#### [Biped Nodebot](http://jsfiddle.net/rwaldron/WZkn5/show/light/)
#### [LCD Running Man](http://jsfiddle.net/rwaldron/xKwaU/show/light/)
#### [Slider Controlled Panning Servo](http://jsfiddle.net/rwaldron/kZakv/show/light/)
#### [Joystick Controlled Laser (pan/tilt) 1](http://jsfiddle.net/rwaldron/HPqms/show/light/)
#### [Joystick Controlled Laser (pan/tilt) 2](http://jsfiddle.net/rwaldron/YHb7A/show/light/)
#### [Joystick Controlled Claw](http://jsfiddle.net/rwaldron/6ZXFe/show/light/)
#### [Robot Claw](http://jsfiddle.net/rwaldron/CFSZJ/show/light/)
#### [Joystick, Motor & Led](http://jsfiddle.net/rwaldron/gADSz/show/light/)



## Setup and Assemble Arduino

- Recommended Starting Kit: [Sparkfun Inventor's Kit](https://www.sparkfun.com/products/11236)
- Download [Arduino IDE](http://arduino.cc/en/main/software)
- Plug in your Arduino or Arduino compatible microcontroller via USB
- Open the Arduino IDE, select: File > Examples > Firmata > StandardFirmata
- Click the "Upload" button.

If the upload was successful, the board is now prepared and you can close the Arduino IDE.


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


### Board
- [Board](https://github.com/rwldrn/johnny-five/blob/master/docs/board.md)
- [Board With Port](https://github.com/rwldrn/johnny-five/blob/master/docs/board-with-port.md)
- [Board Multi](https://github.com/rwldrn/johnny-five/blob/master/docs/board-multi.md)
- [Repl](https://github.com/rwldrn/johnny-five/blob/master/docs/repl.md)
- [Shiftregister](https://github.com/rwldrn/johnny-five/blob/master/docs/shiftregister.md)
- [Pin](https://github.com/rwldrn/johnny-five/blob/master/docs/pin.md)
- [Pin Circuit Event](https://github.com/rwldrn/johnny-five/blob/master/docs/pin-circuit-event.md)
- [Whisker](https://github.com/rwldrn/johnny-five/blob/master/docs/whisker.md)

### JSConf
- [Nodebot](https://github.com/rwldrn/johnny-five/blob/master/docs/nodebot.md)

### Nodebots
- [Bug](https://github.com/rwldrn/johnny-five/blob/master/docs/bug.md)
- [Ed](https://github.com/rwldrn/johnny-five/blob/master/docs/ed.md)
- [Navigator](https://github.com/rwldrn/johnny-five/blob/master/docs/navigator.md)
- [Radar](https://github.com/rwldrn/johnny-five/blob/master/docs/radar.md)
- [Whisker](https://github.com/rwldrn/johnny-five/blob/master/docs/whisker.md)

### Servo/Motor
- [Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/servo.md)
- [Servo Options](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-options.md)
- [Servo Array](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-array.md)
- [Servo Digital](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-digital.md)
- [Servo Dual](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-dual.md)
- [Servo Tutorial](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-tutorial.md)
- [Continuous Clock](https://github.com/rwldrn/johnny-five/blob/master/docs/continuous-clock.md)
- [Continuous](https://github.com/rwldrn/johnny-five/blob/master/docs/continuous.md)
- [Motor](https://github.com/rwldrn/johnny-five/blob/master/docs/motor.md)

### Sonar/Ultrasonic
- [Ping](https://github.com/rwldrn/johnny-five/blob/master/docs/ping.md)
- [Sonar Scan](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar-scan.md)
- [Sonar](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar.md)

### Button
- [Button](https://github.com/rwldrn/johnny-five/blob/master/docs/button.md)
- [Button Bumper](https://github.com/rwldrn/johnny-five/blob/master/docs/button-bumper.md)
- [Button Options](https://github.com/rwldrn/johnny-five/blob/master/docs/button-options.md)

### Claw
- [Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/claw.md)

### Gripper
- [Gripper](https://github.com/rwldrn/johnny-five/blob/master/docs/gripper.md)

### Infrared
- [Ir Motion](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-motion.md)
- [Ir Proximity](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-proximity.md)
- [Ir Reflect](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-reflect.md)

### Joystick
- [Joystick](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick.md)
- [Joystick Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-claw.md)
- [Joystick Laser](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-laser.md)
- [Joystick Motor Led](https://github.com/rwldrn/johnny-five/blob/master/docs/joystick-motor-led.md)

### LCD
- [Lcd](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd.md)
- [Lcd Enumeratechars](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd-enumeratechars.md)
- [Lcd Runner 20x4](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd-runner-20x4.md)
- [Lcd Runner](https://github.com/rwldrn/johnny-five/blob/master/docs/lcd-runner.md)

### LED
- [Laser](https://github.com/rwldrn/johnny-five/blob/master/docs/laser.md)
- [Led Matrix](https://github.com/rwldrn/johnny-five/blob/master/docs/led-matrix.md)
- [Led Fade](https://github.com/rwldrn/johnny-five/blob/master/docs/led-fade.md)
- [Led On Off](https://github.com/rwldrn/johnny-five/blob/master/docs/led-on-off.md)
- [Led Pulse](https://github.com/rwldrn/johnny-five/blob/master/docs/led-pulse.md)
- [Led Rgb](https://github.com/rwldrn/johnny-five/blob/master/docs/led-rgb.md)
- [Led Strobe](https://github.com/rwldrn/johnny-five/blob/master/docs/led-strobe.md)
- [Seven Segment](https://github.com/rwldrn/johnny-five/blob/master/docs/seven-segment.md)

### Magnetometer (Compass)
- [Magnetometer Log](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer-log.md)
- [Magnetometer North](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer-north.md)
- [Magnetometer](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer.md)

### NodeConf Demos
- [Nodeconf Compass](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-compass.md)
- [Nodeconf Navigator](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-navigator.md)
- [Nodeconf Radar](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-radar.md)
- [Nodeconf Slider](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-slider.md)

### Wii
- [Nunchuk](https://github.com/rwldrn/johnny-five/blob/master/docs/nunchuk.md)
- [Classic Controller](https://github.com/rwldrn/johnny-five/blob/master/docs/classic-controller.md)

### Sensors
- [Accelerometer](https://github.com/rwldrn/johnny-five/blob/master/docs/accelerometer.md)
- [Accelerometer Pan Tilt](https://github.com/rwldrn/johnny-five/blob/master/docs/accelerometer-pan-tilt.md)
- [Photoresistor](https://github.com/rwldrn/johnny-five/blob/master/docs/photoresistor.md)
- [Potentiometer](https://github.com/rwldrn/johnny-five/blob/master/docs/potentiometer.md)
- [Sensor](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor.md)
- [Sensor Fsr Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-fsr-servo.md)
- [Sensor Fsr](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-fsr.md)
- [Sensor Ir Led Receiver](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-ir-led-receiver.md)
- [Sensor Slider](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-slider.md)
- [Slider Log](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-log.md)
- [Slider Pan](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-pan.md)
- [Slider Servo Control](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-servo-control.md)

### TinkerKit
- [Tinkerkit Blink](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-blink.md)
- [Tinkerkit Button](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-button.md)
- [Tinkerkit Continuous Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-continuous-servo.md)
- [Tinkerkit Combo](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-combo.md)
- [Tinkerkit Joystick](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-joystick.md)
- [Tinkerkit Linear Pot](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-linear-pot.md)
- [Tinkerkit Rotary](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-rotary.md)
- [Tinkerkit Thermistor](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-thermistor.md)
- [Tinkerkit Tilt](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-tilt.md)
- [Tinkerkit Touch](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-touch.md)




## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
