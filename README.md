![](https://github.com/rwaldron/johnny-five/raw/master/assets/sgier-johnny-five.png)

# Johnny-Five
### The JavaScript Robotics Programming Framework

<!-- 

    Hello!

    Please don't edit this file!

    If you'd like to make changes to the readme contents, please make them in the tpl/.readme.md file. If you'd like to add an example: 

    1. Add the file in `eg/`
    2. Add a breadboard image in `docs/breadboards`
    3. Add an entry to `tpl/programs.json`. 
    4. Generated the markdown with: `grunt examples`







































-->


_Artwork by [Mike Sgier](http://msgierillustration.com)_

[![Travis Build Status](https://travis-ci.org/rwaldron/johnny-five.svg?branch=master)](https://travis-ci.org/rwaldron/johnny-five)
[![Appveyor Build Status](https://ci.appveyor.com/api/projects/status/hmke71k7uemtnami/branch/master?svg=true)](https://ci.appveyor.com/project/rwaldron/johnny-five)
[![Coverage Status](https://coveralls.io/repos/github/rwaldron/johnny-five/badge.svg?branch=master)](https://coveralls.io/github/rwaldron/johnny-five?branch=master)
[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/rwaldron/johnny-five?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



**Johnny-Five is an Open Source, Firmata Protocol based, IoT and Robotics programming framework, developed at [Bocoup](http://bocoup.com). Johnny-Five programs can be written for Arduino (all models), Electric Imp, Beagle Bone, Intel Galileo & Edison, Linino One, Pinoccio, pcDuino3, Raspberry Pi, Particle/Spark Core & Photon, Tessel 2, TI Launchpad and more!**

Johnny-Five has grown from a passion project into a tool for inspiring learning and creativity for people of all ages, backgrounds, and from all across the world.

Just interested in learning and building awesome things? You might want to start with the official [Johnny-Five website](http://johnny-five.io). The website combines content from this repo, the wiki, tutorials from the Bocoup blog and several third-party websites into a single, easily-discoverable source:

* If you want to find the API documentation, [that’s right here](http://johnny-five.io/api/).
* Need to figure out what platform to use for a project? We put that stuff [here](http://johnny-five.io/platform-support/).
* Need inspiration for your next NodeBot? Check out the [examples](http://johnny-five.io/examples/).
* Want to stay up-to-date with projects in the community? [Check this out](http://johnny-five.io/articles/).
* Need NodeBots community or Johnny-Five project updates and announcements? [This](http://johnny-five.io/news/) is what you’re looking for.


Johnny-Five does not attempt to provide "all the things", but instead focuses on delivering robust, reality tested, highly composable APIs that behave consistently across all supported hardware platforms. Johnny-Five wants to be a baseline control kit for hardware projects, allowing you the freedom to build, grow and experiment with diverse JavaScript libraries of your own choice. Johnny-Five couples comfortably with:

- Popular application libraries such as [Express.js](http://expressjs.com/) and [Socket.io](http://socket.io/).
- Fellow hardware projects like [ar-drone](https://github.com/felixge/node-ar-drone), [Aerogel](https://github.com/ceejbot/aerogel) and [Spheron](https://github.com/alchemycs/spheron)
- Bluetooth game controllers like [XBox Controller](https://github.com/andrew/node-xbox-controller) and [DualShock](https://github.com/rdepena/node-dualshock-controller)
- IoT frameworks, such as [Octoblu](http://www.octoblu.com/)

...And that's only a few of the many explorable possibilities. Check out these exciting projects: [node-pulsesensor](https://www.npmjs.org/package/node-pulsesensor), [footballbot-workshop-ui](https://www.npmjs.org/package/footballbot-workshop-ui), [nodebotui](https://www.npmjs.org/package/nodebotui), [dublin-disco](https://www.npmjs.org/package/dublin-disco), [node-slot-car-bot](https://www.npmjs.org/package/node-slot-car-bot), [servo-calibrator](https://www.npmjs.org/package/servo-calibrator), [node-ardx](https://www.npmjs.org/package/node-ardx), [nodebot-workshop](https://www.npmjs.org/package/nodebot-workshop), [phone-home](https://www.npmjs.org/package/phone-home), [purple-unicorn](https://www.npmjs.org/package/purple-unicorn), [webduino](https://www.npmjs.org/package/webduino), [leapduino](https://www.npmjs.org/package/leapduino), [lasercat-workshop](https://www.npmjs.org/package/lasercat-workshop), [simplesense](https://www.npmjs.org/package/simplesense), [five-redbot](https://www.npmjs.org/package/five-redbot), [robotnik](https://www.npmjs.org/package/robotnik), [the-blender](https://www.npmjs.org/package/the-blender)


**Why JavaScript?**
[NodeBots: The Rise of JavaScript Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics)

## Hello Johnny

The ubiquitous "Hello World" program of the microcontroller and SoC world is "blink an LED". The following code demonstrates how this is done using the Johnny-Five framework.

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // Create an Led on pin 13
  var led = new five.Led(13);
  // Blink every half second
  led.blink(500);
});
```

<img src="https://github.com/rwaldron/johnny-five/raw/master/assets/led-blink.gif">

> Note: Node will crash if you try to run johnny-five in the node REPL, but board instances will create their own contextual REPL. Put your script in a file.


## Supported Hardware

Johnny-Five has been tested on a variety of Arduino-compatible [Boards](https://github.com/rwaldron/johnny-five/wiki/Board).

For non-Arduino based projects, a number of platform-specific [IO Plugins](https://github.com/rwaldron/johnny-five/wiki/IO-Plugins) are available. IO Plugins allow Johnny-Five code to communicate with any non-Arduino based hardware in whatever language that platforms speaks!

## Documentation

Documentation for the Johnny-Five API can be found [here](http://johnny-five.io/api/) and [example programs here](http://johnny-five.io/examples/).

## Guidance

Need help? Ask a question on the [NodeBots Community Forum](http://forums.nodebots.io). If you just have a quick question or are interested in ongoing design discussions, join us in the [Johnny-Five Gitter Chat](https://gitter.im/rwaldron/johnny-five).

For step-by-step examples, including an electronics primer, check out [Arduino Experimenter's Guide for NodeJS](http://node-ardx.org/) by [@AnnaGerber](https://twitter.com/AnnaGerber)

Here is a list of [prerequisites](https://github.com/rwaldron/johnny-five/wiki/Getting-Started#prerequisites) for Linux, OSX or Windows.

Check out the [bluetooth guide](https://github.com/rwaldron/johnny-five/wiki/JY-MCU-Bluetooth-Serial-Port-Module-Notes) if you want to remotely control your robot.

## Setup and Assemble Arduino

- Recommended Starting Kit: [Sparkfun Inventor's Kit](https://www.sparkfun.com/products/12001)
- Download [Arduino IDE](http://arduino.cc/en/main/software)
- Plug in your Arduino or Arduino compatible microcontroller via USB
- Open the Arduino IDE, select: File > Examples > Firmata > StandardFirmataPlus
    + StandardFirmataPlus is available in Firmata v2.5.0 or greater
- Click the "Upload" button.

If the upload was successful, the board is now prepared and you can close the Arduino IDE.

For non-Arduino projects, each IO Plugin's repo will provide its own platform specific setup instructions.


## Hey you, here's Johnny!

#### Source Code:

``` bash
git clone git://github.com/rwaldron/johnny-five.git && cd johnny-five

npm install
```

#### npm package:

Install the module with:

```bash
npm install johnny-five
```


## Example Programs

To get you up and running quickly, we provide a variety of examples for using each Johnny-Five component. One thing we’re especially excited about is the extensive collection of [Fritzing](http://fritzing.org/home/) diagrams you’ll find throughout the site. A huge part of doing any Johnny-Five project is handling the actual hardware, and we’ve included these as part of the documentation because we realised that instructions on how to write code to control a servo are insufficient without instructions on how to connect a servo!

To interactively navigate the examples, visit the [Johnny-Five examples](http://johnny-five.io/examples/) page on the official website. If you want to link directly to the examples in this repo, you can use one of the following links.

**There are presently 357 example programs with code and diagrams!**

<!--extract-start:examples-->

### Board
- [Board - Basic Initialization](https://github.com/rwaldron/johnny-five/blob/master/docs/board.md)
- [Board - Cleanup in 'exit' event](https://github.com/rwaldron/johnny-five/blob/master/docs/board-cleanup.md)
- [Board - Multiple in one program](https://github.com/rwaldron/johnny-five/blob/master/docs/board-multi.md)
- [Board - Specify Sampling Interval](https://github.com/rwaldron/johnny-five/blob/master/docs/board-sampling-interval.md)
- [Board - Specify port](https://github.com/rwaldron/johnny-five/blob/master/docs/board-with-port.md)
- [Custom Data Properties](https://github.com/rwaldron/johnny-five/blob/master/docs/custom-properties.md)
- [Pin](https://github.com/rwaldron/johnny-five/blob/master/docs/pin.md)
- [REPL](https://github.com/rwaldron/johnny-five/blob/master/docs/repl.md)

### LED
- [LED](https://github.com/rwaldron/johnny-five/blob/master/docs/led.md)
- [LED - Blink](https://github.com/rwaldron/johnny-five/blob/master/docs/led-blink.md)
- [LED - Demo sequence](https://github.com/rwaldron/johnny-five/blob/master/docs/led-demo-sequence.md)
- [LED - Fade](https://github.com/rwaldron/johnny-five/blob/master/docs/led-fade.md)
- [LED - Fade callback](https://github.com/rwaldron/johnny-five/blob/master/docs/led-fade-callback.md)
- [LED - Fade with animation](https://github.com/rwaldron/johnny-five/blob/master/docs/led-fade-animation.md)
- [LED - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/led-PCA9685.md)
- [LED - Pulse](https://github.com/rwaldron/johnny-five/blob/master/docs/led-pulse.md)
- [LED - Pulse with animation](https://github.com/rwaldron/johnny-five/blob/master/docs/led-pulse-animation.md)
- [LED - Slider](https://github.com/rwaldron/johnny-five/blob/master/docs/led-slider.md)
- [LED - Tessel Servo Module](https://github.com/rwaldron/johnny-five/blob/master/docs/led-tessel-servo-module.md)
- [LEDs - An array of LEDs](https://github.com/rwaldron/johnny-five/blob/master/docs/led-array.md)
- [LEDs - Controlling an array of LEDs](https://github.com/rwaldron/johnny-five/blob/master/docs/led-array-controller.md)

### LED: RGB
- [LED - RGB](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb.md)
- [LED - RGB (Common Anode)](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb-anode.md)
- [LED - RGB (Common Anode) PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb-anode-PCA9685.md)
- [LED - RGB Intensity](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb-intensity.md)
- [LED - Rainbow](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rainbow.md)
- [LED - Rainbow BlinkM](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb-BLINKM.md)

### LED: Digits & Matrix
- [LED - Digital Clock](https://github.com/rwaldron/johnny-five/blob/master/docs/led-digits-clock.md)
- [LED - Digital Clock, Dual Displays](https://github.com/rwaldron/johnny-five/blob/master/docs/led-digits-clock-dual.md)
- [LED - Digital Clock, HT16K33](https://github.com/rwaldron/johnny-five/blob/master/docs/led-digits-clock-HT16K33.md)
- [LED - Draw Matrix Characters Demo](https://github.com/rwaldron/johnny-five/blob/master/docs/led-chars-demo.md)
- [LED - Enumerate Matrix Characters & Symbols](https://github.com/rwaldron/johnny-five/blob/master/docs/led-enumeratechars.md)
- [LED - Matrix](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix.md)
- [LED - Matrix Demo](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix-tutorial.md)
- [LED - Matrix HT16K33](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix-HT16K33.md)
- [LED - Matrix HT16K33 16x8](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix-HT16K33-16x8.md)

### Servo
- [Servo](https://github.com/rwaldron/johnny-five/blob/master/docs/servo.md)
- [Servo - Continuous](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-continuous.md)
- [Servo - Drive](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-drive.md)
- [Servo - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-PCA9685.md)
- [Servo - Prompt](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-prompt.md)
- [Servo - Slider control](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-slider.md)
- [Servo - Sweep](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-sweep.md)
- [Servo - Tessel Servo Module](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-tessel-servo-module.md)
- [Servos - An array of servos](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-array.md)

### GPS
- [GPS - Adafruit Ultimate GPS Breakout](https://github.com/rwaldron/johnny-five/blob/master/docs/gps-adafruit.md)
- [GPS - Default GPS](https://github.com/rwaldron/johnny-five/blob/master/docs/gps.md)
- [GPS - Sparkfun GP-20U7](https://github.com/rwaldron/johnny-five/blob/master/docs/gps-GP-20U7.md)

### Servo Animation
- [Servo - Animation](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-animation.md)
- [Servo - Leg Animation](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-animation-leg.md)

### Color
- [Color - EVShield EV3 (Code)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-EVS_EV3.md)
- [Color - EVShield EV3 (Raw)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-raw-EVS_EV3.md)
- [Color - EVShield NXT (Code)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-EVS_NXT.md)
- [Color - ISL29125](https://github.com/rwaldron/johnny-five/blob/master/docs/color-ISL29125.md)

### Motor
- [Motor](https://github.com/rwaldron/johnny-five/blob/master/docs/motor.md)
- [Motor - 3 pin](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-3-pin.md)
- [Motor - Brake](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-brake.md)
- [Motor - Current](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-current.md)
- [Motor - Directional](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-directional.md)
- [Motor - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_EV3.md)
- [Motor - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_NXT.md)
- [Motor - Enable Pin](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-enable.md)
- [Motor - GROVE_I2C_MOTOR_DRIVER](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-GROVE_I2C.md)
- [Motor - H-Bridge](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-hbridge.md)
- [Motor - LUDUS](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-LUDUS.md)
- [Motor - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-PCA9685.md)
- [Motor - Sparkfun Dual H-bridge Edison Block](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-sparkfun-edison-hbridge.md)
- [Motor - Sparkfun TB6612FNG](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-TB6612FNG.md)
- [Motor - l298 Breakout](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-l298-breakout.md)
- [Motors - Dual H-Bridge](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-hbridge-dual.md)

### Stepper Motor
- [Stepper - Driver](https://github.com/rwaldron/johnny-five/blob/master/docs/stepper-driver.md)
- [Stepper - Sweep](https://github.com/rwaldron/johnny-five/blob/master/docs/stepper-sweep.md)

### ESC & Brushless Motor
- [ESC - Bidirectional](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-bidirectional.md)
- [ESC - Bidirectional Forward-Reverse](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-bidirectional-forward-reverse.md)
- [ESC - Dualshock controlled ESCs](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-dualshock.md)
- [ESC - Keypress controlled ESCs](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-keypress.md)
- [ESC - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-PCA9685.md)
- [ESCs - An array of ESCs](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-array.md)

### Button / Switch
- [Button](https://github.com/rwaldron/johnny-five/blob/master/docs/button.md)
- [Button - Bumper](https://github.com/rwaldron/johnny-five/blob/master/docs/button-bumper.md)
- [Button - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_EV3.md)
- [Button - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_NXT.md)
- [Button - Options](https://github.com/rwaldron/johnny-five/blob/master/docs/button-options.md)
- [Button - Pullup](https://github.com/rwaldron/johnny-five/blob/master/docs/button-pullup.md)
- [Buttons - Collection w/ AT42QT1070](https://github.com/rwaldron/johnny-five/blob/master/docs/button-collection-AT42QT1070.md)
- [Switch - Magnetic Door](https://github.com/rwaldron/johnny-five/blob/master/docs/switch-magnetic-door.md)
- [Switch - Tilt SW-200D](https://github.com/rwaldron/johnny-five/blob/master/docs/switch-tilt-SW_200D.md)
- [Toggle Switch](https://github.com/rwaldron/johnny-five/blob/master/docs/toggle-switch.md)

### Keypad
- [Keypad - 3x4 I2C Nano Backpack](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-3X4_I2C_NANO_BACKPACK.md)
- [Keypad - VKEY](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-analog-vkey.md)
- [Keypad - Waveshare AD](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-analog-ad.md)
- [Touchpad - Grove QTouch](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-QTOUCH.md)
- [Touchpad - MPR121](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-MPR121.md)
- [Touchpad - MPR121, Sensitivity](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-MPR121-sensitivity.md)
- [Touchpad - MPR121QR2_SHIELD](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-MPR121QR2_SHIELD.md)
- [Touchpad - MPR121_KEYPAD](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-MPR121_KEYPAD.md)
- [Touchpad - MPR121_SHIELD](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-MPR121_SHIELD.md)

### Relay
- [Relay](https://github.com/rwaldron/johnny-five/blob/master/docs/relay.md)
- [Relay - Collection](https://github.com/rwaldron/johnny-five/blob/master/docs/relay-collection.md)

### Shift Register
- [Shift Register](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register.md)
- [Shift Register - Common Anode Seven Segment controller](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register-seven-segment-anode.md)
- [Shift Register - Common Anode Seven segments, Chained](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register-daisy-chain-anode.md)
- [Shift Register - Seven Segment controller](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register-seven-segment.md)
- [Shift Register - Seven segments, Chained](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register-daisy-chain.md)

### Infrared Reflectance
- [IR Motion](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-motion.md)
- [IR Proximity](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-proximity.md)
- [IR Reflectance](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-reflect.md)
- [IR Reflectance Array](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-reflect-array.md)

### Proximity
- [Proximity](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity.md)
- [Proximity - EVShield EV3 (IR)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_IR-alert.md)
- [Proximity - EVShield EV3 (IR)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_IR.md)
- [Proximity - EVShield EV3 (Ultrasonic)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_US.md)
- [Proximity - EVShield EV3 (Ultrasonic)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_US-alert.md)
- [Proximity - GP2Y0A710K0F](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-GP2Y0A710K0F.md)
- [Proximity - HC-SR04](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-hcsr04.md)
- [Proximity - HC-SR04 (Analog)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-hcsr04-analog.md)
- [Proximity - HC-SR04 I2C Backpack](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-hcsr04-i2c.md)
- [Proximity - LIDAR-Lite](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-lidarlite.md)
- [Proximity - MB1000](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1000.md)
- [Proximity - MB1003](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1003.md)
- [Proximity - MB1010](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1010.md)
- [Proximity - MB1230](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1230.md)
- [Proximity - SRF10](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-srf10.md)

### Motion
- [Motion](https://github.com/rwaldron/johnny-five/blob/master/docs/motion.md)
- [Motion - GP2Y0A60SZLF](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-GP2Y0A60SZLF.md)
- [Motion - GP2Y0D805Z0F](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-gp2y0d805z0f.md)
- [Motion - GP2Y0D810Z0F](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-gp2y0d810z0f.md)
- [Motion - GP2Y0D810Z0F](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-gp2y0d815z0f.md)

### Joystick
- [Joystick](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick.md)
- [Joystick - Esplora](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick-esplora.md)
- [Joystick - Pan + Tilt control](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick-pantilt.md)
- [Joystick - Sparkfun Shield](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick-shield.md)

### LCD
- [Grove - RGB LCD Color Previewer](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-rgb-bgcolor-previewer.md)
- [LCD](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd.md)
- [LCD - Enumerate characters](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-enumeratechars.md)
- [LCD - I2C](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-i2c.md)
- [LCD - I2C PCF8574](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-i2c-PCF8574.md)
- [LCD - I2C Runner](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-i2c-runner.md)
- [LCD - Runner 16x2](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-runner.md)
- [LCD - Runner 20x4](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-runner-20x4.md)
- [LCD - Tessel 2 16x2](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-16x2-tessel.md)
- [Tessel 2 + Grove - RGB LCD Color Previewer](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-rgb-bgcolor-previewer-tessel.md)
- [Tessel 2 + Grove - RGB LCD Display](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-rgb-tessel-grove-JHD1313M1.md)

### Compass/Magnetometer
- [Compass - Find north](https://github.com/rwaldron/johnny-five/blob/master/docs/magnetometer-north.md)
- [Compass - HMC5883L](https://github.com/rwaldron/johnny-five/blob/master/docs/compass-hmc5883l.md)
- [Compass - HMC6352](https://github.com/rwaldron/johnny-five/blob/master/docs/compass-hmc6352.md)
- [Compass - Logger](https://github.com/rwaldron/johnny-five/blob/master/docs/magnetometer-log.md)
- [Compass - MAG3110](https://github.com/rwaldron/johnny-five/blob/master/docs/compass-MAG3110.md)
- [Compass - MAG3110 on Tessel 2](https://github.com/rwaldron/johnny-five/blob/master/docs/compass-MAG3110-tessel.md)
- [Compass / Magnetometer](https://github.com/rwaldron/johnny-five/blob/master/docs/magnetometer.md)

### Piezo
- [Piezo](https://github.com/rwaldron/johnny-five/blob/master/docs/piezo.md)

### IMU/Multi
- [IMU - BNO055](https://github.com/rwaldron/johnny-five/blob/master/docs/imu-bno055.md)
- [IMU - BNO055 (Orientation)](https://github.com/rwaldron/johnny-five/blob/master/docs/imu-bno055-orientation.md)
- [IMU - MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/imu-mpu6050.md)
- [Multi - BME280](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-BME280.md)
- [Multi - BMP085](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-bmp085.md)
- [Multi - BMP180](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-bmp180.md)
- [Multi - DHT11_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-DHT11_I2C_NANO_BACKPACK.md)
- [Multi - DHT21_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-DHT21_I2C_NANO_BACKPACK.md)
- [Multi - DHT22_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-DHT22_I2C_NANO_BACKPACK.md)
- [Multi - HIH6130](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-HIH6130.md)
- [Multi - HTU21D](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-htu21d.md)
- [Multi - MPL115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-mpl115a2.md)
- [Multi - MPL3115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-mpl3115a2.md)
- [Multi - MS5611](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-MS5611.md)
- [Multi - SHT31D](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-sht31d.md)
- [Multi - SI7020](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-SI7020.md)
- [Multi - SI7021](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-SI7021.md)
- [Multi - TH02](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-TH02.md)

### Sensors
- [Accelerometer](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer.md)
- [Accelerometer - ADXL335](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-adxl335.md)
- [Accelerometer - ADXL345](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-adxl345.md)
- [Accelerometer - LIS3DH](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-LIS3DH.md)
- [Accelerometer - MMA7361](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-mma7361.md)
- [Accelerometer - MMA8452](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-MMA8452.md)
- [Accelerometer - MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-mpu6050.md)
- [Accelerometer - Pan + Tilt](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-pan-tilt.md)
- [Altimeter - BMP085](https://github.com/rwaldron/johnny-five/blob/master/docs/altimeter-BMP085.md)
- [Altimeter - BMP180](https://github.com/rwaldron/johnny-five/blob/master/docs/altimeter-BMP180.md)
- [Altimeter - MPL3115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/altimeter-mpl3115a2.md)
- [Altimeter - MS5611](https://github.com/rwaldron/johnny-five/blob/master/docs/altimeter-MS5611.md)
- [Barometer - BMP085](https://github.com/rwaldron/johnny-five/blob/master/docs/barometer-BMP085.md)
- [Barometer - BMP180](https://github.com/rwaldron/johnny-five/blob/master/docs/barometer-BMP180.md)
- [Barometer - MPL115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/barometer-mpl115a2.md)
- [Barometer - MPL3115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/barometer-mpl3115a2.md)
- [Barometer - MS5611](https://github.com/rwaldron/johnny-five/blob/master/docs/barometer-MS5611.md)
- [Gyro](https://github.com/rwaldron/johnny-five/blob/master/docs/gyro.md)
- [Gyro - Analog LPR5150AL](https://github.com/rwaldron/johnny-five/blob/master/docs/gyro-lpr5150l.md)
- [Gyro - I2C MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/gyro-mpu6050.md)
- [Hygrometer - DHT11_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-DHT11_I2C_NANO_BACKPACK.md)
- [Hygrometer - DHT21_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-DHT21_I2C_NANO_BACKPACK.md)
- [Hygrometer - DHT22_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-DHT22_I2C_NANO_BACKPACK.md)
- [Hygrometer - HIH6130](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-HIH6130.md)
- [Hygrometer - HTU21D](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-htu21d.md)
- [Hygrometer - SHT31D](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-sht31d.md)
- [Hygrometer - SI7021](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-SI7021.md)
- [Hygrometer - TH02](https://github.com/rwaldron/johnny-five/blob/master/docs/hygrometer-TH02.md)
- [Sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor.md)
- [Sensor - Digital Microwave](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor-digital-microwave.md)
- [Sensor - Force sensitive resistor](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor-fsr.md)
- [Sensor - Microphone](https://github.com/rwaldron/johnny-five/blob/master/docs/microphone.md)
- [Sensor - Photoresistor](https://github.com/rwaldron/johnny-five/blob/master/docs/photoresistor.md)
- [Sensor - Potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/potentiometer.md)
- [Sensor - Slide potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor-slider.md)
- [Thermometer - BMP085](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-bmp085.md)
- [Thermometer - BMP180](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-BMP180.md)
- [Thermometer - DHT11_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-DHT11_I2C_NANO_BACKPACK.md)
- [Thermometer - DHT21_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-DHT21_I2C_NANO_BACKPACK.md)
- [Thermometer - DHT22_I2C_NANO_BACKPACK](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-DHT22_I2C_NANO_BACKPACK.md)
- [Thermometer - DS18B20](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-ds18b20.md)
- [Thermometer - HIH6130](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-HIH6130.md)
- [Thermometer - HTU21D](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-htu21d.md)
- [Thermometer - LM335](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-lm335.md)
- [Thermometer - LM35](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-lm35.md)
- [Thermometer - MAX31850](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-max31850k.md)
- [Thermometer - MCP9808](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-MCP9808.md)
- [Thermometer - MPL115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-mpl115a2.md)
- [Thermometer - MPL3115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-mpl3115a2.md)
- [Thermometer - MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-mpu6050.md)
- [Thermometer - MS5611](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-MS5611.md)
- [Thermometer - SHT31D](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-sht31d.md)
- [Thermometer - SI7020](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-SI7020.md)
- [Thermometer - SI7021](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-SI7021.md)
- [Thermometer - TH02](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-TH02.md)
- [Thermometer - TMP102](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-tmp102.md)
- [Thermometer - TMP36](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-tmp36.md)

### Expander
- [Expander - 74HC595](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-74HC595.md)
- [Expander - CD74HC4067, 16 Channel Analog Input Breakout](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-CD74HC4067_NANO_BACKPACK.md)
- [Expander - LIS3DH](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-LIS3DH.md)
- [Expander - MCP23008](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-MCP23008.md)
- [Expander - MCP23017](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-MCP23017.md)
- [Expander - MUXSHIELD2, Analog Sensors](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-MUXSHIELD2-analog-read.md)
- [Expander - MUXSHIELD2, Digital Input and Output](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-MUXSHIELD2-mixed.md)
- [Expander - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCA9685.md)
- [Expander - PCF8574](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCF8574.md)
- [Expander - PCF8575](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCF8575.md)
- [Expander - PCF8591](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCF8591.md)

### Photon Weather Shield
- [Photon Weather Shield: Moisture](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor-photon-weather-shield-moisture.md)

### Lego EVShield
- [Button - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_EV3.md)
- [Button - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_NXT.md)
- [Color - EVShield EV3 (Code)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-EVS_EV3.md)
- [Color - EVShield EV3 (Raw)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-raw-EVS_EV3.md)
- [Color - EVShield NXT (Code)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-EVS_NXT.md)
- [Light - BH1750](https://github.com/rwaldron/johnny-five/blob/master/docs/light-ambient-BH1750.md)
- [Light - EVShield EV3 (Ambient)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-ambient-EVS_EV3.md)
- [Light - EVShield EV3 (Reflected)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-reflected-EVS_EV3.md)
- [Light - EVShield NXT (Ambient)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-ambient-EVS_NXT.md)
- [Light - EVShield NXT (Reflected)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-reflected-EVS_NXT.md)
- [Light - TSL2561](https://github.com/rwaldron/johnny-five/blob/master/docs/light-ambient-TSL2561.md)
- [Motor - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_EV3.md)
- [Motor - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_NXT.md)
- [Proximity - EVShield EV3 (IR)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_IR-alert.md)
- [Proximity - EVShield EV3 (Ultrasonic)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_US-alert.md)

### Intel Edison + Grove IoT Kit
- [Intel Edison + Grove - Accelerometer (ADXL345)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-accelerometer-adxl345-edison.md)
- [Intel Edison + Grove - Accelerometer (MMA7660)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-accelerometer-mma7660-edison.md)
- [Intel Edison + Grove - Air quality sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-gas-tp401-edison.md)
- [Intel Edison + Grove - Barometer (BMP180)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-barometer-edison.md)
- [Intel Edison + Grove - Button](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-button-edison.md)
- [Intel Edison + Grove - Compass (HMC588L)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-compass-edison.md)
- [Intel Edison + Grove - Flame Sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-flame-sensor-edison.md)
- [Intel Edison + Grove - Gas (MQ2)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-gas-mq2-edison.md)
- [Intel Edison + Grove - Humidity & Temperature (TH02)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-humidity-temperature-edison.md)
- [Intel Edison + Grove - I2C Motor Driver](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-i2c-motor-driver-edison.md)
- [Intel Edison + Grove - Joystick](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-joystick-edison.md)
- [Intel Edison + Grove - LED](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-led-edison.md)
- [Intel Edison + Grove - Light Sensor (TSL2561)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-light-sensor-edison.md)
- [Intel Edison + Grove - Moisture Sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-moisture-edison.md)
- [Intel Edison + Grove - Q Touch](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-q-touch.md)
- [Intel Edison + Grove - RGB LCD](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb-edison.md)
- [Intel Edison + Grove - RGB LCD Color Previewer](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb-bgcolor-previewer-edison.md)
- [Intel Edison + Grove - RGB LCD temperature display](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb-temperature-display-edison.md)
- [Intel Edison + Grove - Relay](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-relay-edison.md)
- [Intel Edison + Grove - Rotary Potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-rotary-potentiometer-edison.md)
- [Intel Edison + Grove - Servo](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-servo-edison.md)
- [Intel Edison + Grove - Touch](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-touch-edison.md)

### Grove IoT Kit (Seeed Studio)
- [Grove - Button](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-button.md)
- [Grove - Joystick](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-joystick.md)
- [Grove - LED](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-led.md)
- [Grove - Motor (I2C Driver)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-i2c-motor-driver.md)
- [Grove - RGB LCD](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb.md)
- [Grove - RGB LCD temperature display](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb-temperature-display.md)
- [Grove - Rotary Potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-rotary-potentiometer.md)
- [Grove - Servo](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-servo.md)
- [Grove - Touch](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-touch.md)

### Micro Magician V2
- [Micro Magician V2 - Accelerometer](https://github.com/rwaldron/johnny-five/blob/master/docs/micromagician-accelerometer.md)
- [Micro Magician V2 - Motor](https://github.com/rwaldron/johnny-five/blob/master/docs/micromagician-motor.md)
- [Micro Magician V2 - Servo](https://github.com/rwaldron/johnny-five/blob/master/docs/micromagician-servo.md)

### TinkerKit
- [TinkerKit - Accelerometer](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-accelerometer.md)
- [TinkerKit - Blink](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-blink.md)
- [TinkerKit - Button](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-button.md)
- [TinkerKit - Combo](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-combo.md)
- [TinkerKit - Continuous servo](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-continuous-servo.md)
- [TinkerKit - Gyro](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-gyroscope.md)
- [TinkerKit - Joystick](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-joystick.md)
- [TinkerKit - Linear potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-linear-pot.md)
- [TinkerKit - Rotary potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-rotary.md)
- [TinkerKit - Temperature](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-thermistor.md)
- [TinkerKit - Tilt](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-tilt.md)
- [TinkerKit - Touch](https://github.com/rwaldron/johnny-five/blob/master/docs/tinkerkit-touch.md)

### Wii
- [Wii Classic Controller](https://github.com/rwaldron/johnny-five/blob/master/docs/classic-controller.md)
- [Wii Nunchuck](https://github.com/rwaldron/johnny-five/blob/master/docs/nunchuk.md)

### Complete Bots / Projects
- [BOE Bot](https://github.com/rwaldron/johnny-five/blob/master/docs/boe-test-servos.md)
- [Bug](https://github.com/rwaldron/johnny-five/blob/master/docs/bug.md)
- [Kinect Robotic Arm Controller](https://github.com/rwaldron/johnny-five/blob/master/docs/kinect-arm-controller.md)
- [Laser Trip Wire](https://github.com/rwaldron/johnny-five/blob/master/docs/laser-trip-wire.md)
- [Line Follower](https://github.com/rwaldron/johnny-five/blob/master/docs/line-follower.md)
- [Lynxmotion Biped BRAT](https://github.com/rwaldron/johnny-five/blob/master/docs/brat.md)
- [Motobot](https://github.com/rwaldron/johnny-five/blob/master/docs/motobot.md)
- [Navigator](https://github.com/rwaldron/johnny-five/blob/master/docs/navigator.md)
- [Nodebot](https://github.com/rwaldron/johnny-five/blob/master/docs/nodebot.md)
- [Phoenix Hexapod](https://github.com/rwaldron/johnny-five/blob/master/docs/phoenix.md)
- [Radar](https://github.com/rwaldron/johnny-five/blob/master/docs/radar.md)
- [Robotic Claw](https://github.com/rwaldron/johnny-five/blob/master/docs/claw.md)
- [Whisker](https://github.com/rwaldron/johnny-five/blob/master/docs/whisker.md)

### Component Plugin Template
- [Example plugin](https://github.com/rwaldron/johnny-five/blob/master/docs/plugin.md)

### IO Plugins
- [Led Blink on Electric Imp](https://github.com/rwaldron/johnny-five/blob/master/docs/imp-io.md)
- [Led Blink on Intel Edison Arduino Board](https://github.com/rwaldron/johnny-five/blob/master/docs/edison-io-arduino.md)
- [Led Blink on Intel Edison Mini Board](https://github.com/rwaldron/johnny-five/blob/master/docs/edison-io-miniboard.md)
- [Led Blink on Intel Galileo Gen 2](https://github.com/rwaldron/johnny-five/blob/master/docs/galileo-io.md)
- [Led Blink on Raspberry Pi](https://github.com/rwaldron/johnny-five/blob/master/docs/raspi-io.md)
- [Led Blink on Spark Core](https://github.com/rwaldron/johnny-five/blob/master/docs/spark-io.md)
- [Led Blink on pcDuino3](https://github.com/rwaldron/johnny-five/blob/master/docs/pcduino-io.md)

<!--extract-end:examples-->

## Many fragments. Some large, some small.

#### [Wireless Nodebot](http://jsfiddle.net/rwaldron/88M6b/show/light)
#### [Kinect Controlled Robot Arm](http://jsfiddle.net/rwaldron/XMsGQ/show/light/)
#### [Biped Nodebot](http://jsfiddle.net/rwaldron/WZkn5/show/light/)
#### [LCD Running Man](http://jsfiddle.net/rwaldron/xKwaU/show/light/)
#### [Slider Controlled Panning Servo](http://jsfiddle.net/rwaldron/kZakv/show/light/)
#### [Joystick Controlled Laser (pan/tilt) 1](http://jsfiddle.net/rwaldron/HPqms/show/light/)
#### [Joystick Controlled Laser (pan/tilt) 2](http://jsfiddle.net/rwaldron/YHb7A/show/light/)
#### [Joystick Controlled Claw](http://jsfiddle.net/rwaldron/6ZXFe/show/light/)
#### [Robot Claw](http://jsfiddle.net/rwaldron/CFSZJ/show/light/)
#### [Joystick, Motor & Led](http://jsfiddle.net/rwaldron/gADSz/show/light/)
#### [Build you own drone](http://github.com/darioodiaz/node-open-pilot/)



## Make: JavaScript Robotics

[![](http://ecx.images-amazon.com/images/I/91ae8ZZDQ2L.jpg)](http://shop.oreilly.com/product/0636920031390.do)




## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwaldron/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).


## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
