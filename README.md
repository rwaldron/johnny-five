<img src="https://github.com/rwldrn/johnny-five/raw/master/assets/sgier-johnny-five.png">

# Node-isassemble Johnny-Five

[![Build Status](https://travis-ci.org/rwaldron/johnny-five.png?branch=master)](https://travis-ci.org/rwaldron/johnny-five)


#### Johnny-Five is an Open Source, JavaScript Arduino programming framework, developed at [Bocoup](http://bocoup.com).


#### Why JavaScript? [NodeBots: The Rise of JavaScript Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics)

#### Johnny-Five artwork by [Mike Sgier](http://msgierillustration.com)

## IO Plugins

For non-Arduino based projects, the following platform [IO Plugins](https://github.com/rwaldron/johnny-five/wiki/IO-Plugins) are available:

- Beagle Bone
  - [BeagleBone-IO](https://github.com/julianduque/beaglebone-io)
- Intel Galileo
  - [Galileo-IO](https://github.com/rwaldron/galileo-io/)
- Pinoccio
  - [Pinoccio-IO](https://github.com/soldair/pinoccio-io/)
- Raspberry Pi
  - [Raspi-IO](https://gitlab.theoreticalideations.com/nebrius/raspi-io/)
- Spark Core
  - [Spark-IO](https://github.com/rwaldron/spark-io/)
- IO Board (Generic IO Plugin class to make your own!)
  - [IOBoard](https://github.com/achingbrain/node-ioboard)


## Documentation

Documentation for the Johnny-Five API can be found [here](https://github.com/rwaldron/johnny-five/wiki)

## Guidance

For step-by-step examples, including an electronics primer, check out [Arduino Experimenter's Guide for NodeJS](http://node-ardx.org/) by [@AnnaGerber](https://twitter.com/AnnaGerber)

Here is a list of [prerequites](https://github.com/rwaldron/johnny-five/wiki/Prerequites) for Linux, OSX or Windows.

Check out the [bluetooth guide](https://github.com/rwaldron/johnny-five/wiki/JY-MCU-Bluetooth-Serial-Port-Module-Notes) if you want to remotely controll your robot.

## Setup and Assemble Arduino

- Recommended Starting Kit: [Sparkfun Inventor's Kit](https://www.sparkfun.com/products/12001)
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
[Watch it here!](http://jsfiddle.net/rwaldron/dtudh/show/light)

> Note: Node will crash if you try to run johnny-five in the node REPL, but board instances will create their own contextual REPL. Put your script in a file.



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


## Example Programs


### Board
- [Board](https://github.com/rwldrn/johnny-five/blob/master/docs/board.md)
- [Board With Port](https://github.com/rwldrn/johnny-five/blob/master/docs/board-with-port.md)
- [Board Multi](https://github.com/rwldrn/johnny-five/blob/master/docs/board-multi.md)
- [Repl](https://github.com/rwldrn/johnny-five/blob/master/docs/repl.md)
- [Shiftregister](https://github.com/rwldrn/johnny-five/blob/master/docs/shiftregister.md)
- [Pin](https://github.com/rwldrn/johnny-five/blob/master/docs/pin.md)
- [Pin Circuit Event](https://github.com/rwldrn/johnny-five/blob/master/docs/pin-circuit-event.md)
- [Pin Dtoa](https://github.com/rwldrn/johnny-five/blob/master/docs/pin-dtoa.md)
- [Whisker](https://github.com/rwldrn/johnny-five/blob/master/docs/whisker.md)

### JSConf
- [Nodebot](https://github.com/rwldrn/johnny-five/blob/master/docs/nodebot.md)

### Nodebots
- [Bug](https://github.com/rwldrn/johnny-five/blob/master/docs/bug.md)
- [Ed](https://github.com/rwldrn/johnny-five/blob/master/docs/ed.md)
- [Navigator](https://github.com/rwldrn/johnny-five/blob/master/docs/navigator.md)
- [Radar](https://github.com/rwldrn/johnny-five/blob/master/docs/radar.md)
- [Whisker](https://github.com/rwldrn/johnny-five/blob/master/docs/whisker.md)

### Servo
- [Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/servo.md)
- [Servo Continuous](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-continuous.md)
- [Servo Sweep](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-sweep.md)
- [Servo Slider](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-slider.md)
- [Servo Prompt](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-prompt.md)
- [Servo Keypress](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-keypress.md)
- [Servo Drive](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-drive.md)
- [Servo Diagnostic](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-diagnostic.md)
- [Servo Array](https://github.com/rwldrn/johnny-five/blob/master/docs/servo-array.md)
- [Boe Test Servos](https://github.com/rwldrn/johnny-five/blob/master/docs/boe-test-servos.md)

### Motor
- [Motor](https://github.com/rwldrn/johnny-five/blob/master/docs/motor.md)
- [Motor Directional](https://github.com/rwldrn/johnny-five/blob/master/docs/motor-directional.md)
- [Motor Brake](https://github.com/rwldrn/johnny-five/blob/master/docs/motor-brake.md)
- [Motor Current](https://github.com/rwldrn/johnny-five/blob/master/docs/motor-current.md)
- [Motor Hbridge](https://github.com/rwldrn/johnny-five/blob/master/docs/motor-hbridge.md)
- [Motor 3 Pin](https://github.com/rwldrn/johnny-five/blob/master/docs/motor-3-pin.md)
- [Motobot](https://github.com/rwldrn/johnny-five/blob/master/docs/motobot.md)

### Stepper
- [Stepper Driver](https://github.com/rwldrn/johnny-five/blob/master/docs/stepper-driver.md)
- [Stepper Sweep](https://github.com/rwldrn/johnny-five/blob/master/docs/stepper-sweep.md)

### ESC & Brushless Motor
- [Esc Keypress](https://github.com/rwldrn/johnny-five/blob/master/docs/esc-keypress.md)
- [Esc Dualshock](https://github.com/rwldrn/johnny-five/blob/master/docs/esc-dualshock.md)

### Sonar/Ultrasonic
- [Ping](https://github.com/rwldrn/johnny-five/blob/master/docs/ping.md)
- [Sonar Scan](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar-scan.md)
- [Sonar](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar.md)
- [Sonar I2c](https://github.com/rwldrn/johnny-five/blob/master/docs/sonar-i2c.md)

### Button
- [Button](https://github.com/rwldrn/johnny-five/blob/master/docs/button.md)
- [Button Bumper](https://github.com/rwldrn/johnny-five/blob/master/docs/button-bumper.md)
- [Button Options](https://github.com/rwldrn/johnny-five/blob/master/docs/button-options.md)
- [Button Pullup](https://github.com/rwldrn/johnny-five/blob/master/docs/button-pullup.md)

### Relay
- [Relay](https://github.com/rwldrn/johnny-five/blob/master/docs/relay.md)

### Claw
- [Claw](https://github.com/rwldrn/johnny-five/blob/master/docs/claw.md)

### Gripper
- [Gripper](https://github.com/rwldrn/johnny-five/blob/master/docs/gripper.md)

### Infrared
- [Ir Distance](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-distance.md)
- [Ir Motion](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-motion.md)
- [Ir Proximity](https://github.com/rwldrn/johnny-five/blob/master/docs/ir-proximity.md)
- [Proximity](https://github.com/rwldrn/johnny-five/blob/master/docs/proximity.md)
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
- [Led](https://github.com/rwldrn/johnny-five/blob/master/docs/led.md)
- [Led On Off](https://github.com/rwldrn/johnny-five/blob/master/docs/led-on-off.md)
- [Led Strobe](https://github.com/rwldrn/johnny-five/blob/master/docs/led-strobe.md)
- [Led Pulse](https://github.com/rwldrn/johnny-five/blob/master/docs/led-pulse.md)
- [Led Fade](https://github.com/rwldrn/johnny-five/blob/master/docs/led-fade.md)
- [Led Fade Callback](https://github.com/rwldrn/johnny-five/blob/master/docs/led-fade-callback.md)
- [Led Digital](https://github.com/rwldrn/johnny-five/blob/master/docs/led-digital.md)
- [Led Analog](https://github.com/rwldrn/johnny-five/blob/master/docs/led-analog.md)
- [Led Status](https://github.com/rwldrn/johnny-five/blob/master/docs/led-status.md)
- [Led Array](https://github.com/rwldrn/johnny-five/blob/master/docs/led-array.md)
- [Led Rgb](https://github.com/rwldrn/johnny-five/blob/master/docs/led-rgb.md)
- [Led Rgb Anode](https://github.com/rwldrn/johnny-five/blob/master/docs/led-rgb-anode.md)
- [Led Rainbow](https://github.com/rwldrn/johnny-five/blob/master/docs/led-rainbow.md)
- [Led Demo Sequence](https://github.com/rwldrn/johnny-five/blob/master/docs/led-demo-sequence.md)
- [Led Matrix](https://github.com/rwldrn/johnny-five/blob/master/docs/led-matrix.md)
- [Seven Segment](https://github.com/rwldrn/johnny-five/blob/master/docs/seven-segment.md)
- [Laser](https://github.com/rwldrn/johnny-five/blob/master/docs/laser.md)

### Magnetometer (Compass)
- [Magnetometer Log](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer-log.md)
- [Magnetometer North](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer-north.md)
- [Magnetometer](https://github.com/rwldrn/johnny-five/blob/master/docs/magnetometer.md)

### NodeConf Demos
- [Nodeconf Compass](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-compass.md)
- [Nodeconf Navigator](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-navigator.md)
- [Nodeconf Radar](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-radar.md)
- [Nodeconf Slider](https://github.com/rwldrn/johnny-five/blob/master/docs/nodeconf-slider.md)

### Sound
- [Piezo](https://github.com/rwldrn/johnny-five/blob/master/docs/piezo.md)

### Kinect
- [Kinect Arm Controller](https://github.com/rwldrn/johnny-five/blob/master/docs/kinect-arm-controller.md)

### Wii
- [Nunchuk](https://github.com/rwldrn/johnny-five/blob/master/docs/nunchuk.md)
- [Classic Controller](https://github.com/rwldrn/johnny-five/blob/master/docs/classic-controller.md)

### Sensors
- [Accelerometer](https://github.com/rwldrn/johnny-five/blob/master/docs/accelerometer.md)
- [Accelerometer Pan Tilt](https://github.com/rwldrn/johnny-five/blob/master/docs/accelerometer-pan-tilt.md)
- [Gyro](https://github.com/rwldrn/johnny-five/blob/master/docs/gyro.md)
- [Photoresistor](https://github.com/rwldrn/johnny-five/blob/master/docs/photoresistor.md)
- [Photoresistor Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/photoresistor-servo.md)
- [Potentiometer](https://github.com/rwldrn/johnny-five/blob/master/docs/potentiometer.md)
- [Sensor](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor.md)
- [Sensor Fsr Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-fsr-servo.md)
- [Sensor Fsr](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-fsr.md)
- [Sensor Ir Led Receiver](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-ir-led-receiver.md)
- [Sensor Slider](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-slider.md)
- [Slider Log](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-log.md)
- [Slider Pan](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-pan.md)
- [Slider Servo Control](https://github.com/rwldrn/johnny-five/blob/master/docs/slider-servo-control.md)
- [Sensor Temperature Tmp36](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-temperature-tmp36.md)
- [Sensor Temperature Lm35](https://github.com/rwldrn/johnny-five/blob/master/docs/sensor-temperature-lm35.md)

### TinkerKit
- [Tinkerkit Accelerometer](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-accelerometer.md)
- [Tinkerkit Blink](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-blink.md)
- [Tinkerkit Button](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-button.md)
- [Tinkerkit Continuous Servo](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-continuous-servo.md)
- [Tinkerkit Combo](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-combo.md)
- [Tinkerkit Gyroscope](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-gyroscope.md)
- [Tinkerkit Joystick](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-joystick.md)
- [Tinkerkit Linear Pot](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-linear-pot.md)
- [Tinkerkit Rotary](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-rotary.md)
- [Tinkerkit Thermistor](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-thermistor.md)
- [Tinkerkit Tilt](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-tilt.md)
- [Tinkerkit Touch](https://github.com/rwldrn/johnny-five/blob/master/docs/tinkerkit-touch.md)

### Spark
- [Spark Io Blink](https://github.com/rwldrn/johnny-five/blob/master/docs/spark-io-blink.md)




## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).


## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
