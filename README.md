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

[![Build Status](https://travis-ci.org/rwaldron/johnny-five.svg?branch=master)](https://travis-ci.org/rwaldron/johnny-five) 
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/rwaldron/johnny-five?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



**Johnny-Five is an Open Source, Firmata Protocol based, IoT and Robotics programming framework, developed at [Bocoup](http://bocoup.com). Johnny-Five programs can be written for Arduino (all models), Electric Imp, Beagle Bone, Intel Galileo & Edison, Linino One, Pinoccio, pcDuino3, Raspberry Pi, Spark/Particle Core, TI Launchpad and more!**

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

Here is a list of [prerequisites](https://github.com/rwaldron/johnny-five/wiki/Prerequites) for Linux, OSX or Windows.

Check out the [bluetooth guide](https://github.com/rwaldron/johnny-five/wiki/JY-MCU-Bluetooth-Serial-Port-Module-Notes) if you want to remotely control your robot.

## Setup and Assemble Arduino

- Recommended Starting Kit: [Sparkfun Inventor's Kit](https://www.sparkfun.com/products/12001)
- Download [Arduino IDE](http://arduino.cc/en/main/software)
- Plug in your Arduino or Arduino compatible microcontroller via USB
- Open the Arduino IDE, select: File > Examples > Firmata > StandardFirmata
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

<!--extract-start:examples-->

### Board
- [Basic Board initialization](https://github.com/rwaldron/johnny-five/blob/master/docs/board.md)
- [Board - Specify port](https://github.com/rwaldron/johnny-five/blob/master/docs/board-with-port.md)
- [Board - Multiple in one program](https://github.com/rwaldron/johnny-five/blob/master/docs/board-multi.md)
- [REPL](https://github.com/rwaldron/johnny-five/blob/master/docs/repl.md)
- [Pin](https://github.com/rwaldron/johnny-five/blob/master/docs/pin.md)

### Expander
- [Expander - MCP23017](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-MCP23017.md)
- [Expander - MCP23008](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-MCP23008.md)
- [Expander - PCF8574](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCF8574.md)
- [Expander - PCF8575](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCF8575.md)
- [Expander - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCA9685.md)
- [Expander - PCF8591](https://github.com/rwaldron/johnny-five/blob/master/docs/expander-PCF8591.md)

### LED
- [LED](https://github.com/rwaldron/johnny-five/blob/master/docs/led.md)
- [LED - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/led-PCA9685.md)
- [LED - Blink](https://github.com/rwaldron/johnny-five/blob/master/docs/led-blink.md)
- [LED - Pulse](https://github.com/rwaldron/johnny-five/blob/master/docs/led-pulse.md)
- [LED - Pulse with animation](https://github.com/rwaldron/johnny-five/blob/master/docs/led-pulse-animation.md)
- [LED - Fade](https://github.com/rwaldron/johnny-five/blob/master/docs/led-fade.md)
- [LED - Fade callback](https://github.com/rwaldron/johnny-five/blob/master/docs/led-fade-callback.md)
- [LED - Fade with animation](https://github.com/rwaldron/johnny-five/blob/master/docs/led-fade-animation.md)
- [LED - Demo sequence](https://github.com/rwaldron/johnny-five/blob/master/docs/led-demo-sequence.md)
- [LED - Slider](https://github.com/rwaldron/johnny-five/blob/master/docs/led-slider.md)
- [LED - Array](https://github.com/rwaldron/johnny-five/blob/master/docs/led-array.md)
- [LED - RGB](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb.md)
- [LED - RGB (Common Anode)](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb-anode.md)
- [LED - RGB (Common Anode) PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb-anode-PCA9685.md)
- [LED - RGB Intensity](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rgb-intensity.md)
- [LED - Rainbow](https://github.com/rwaldron/johnny-five/blob/master/docs/led-rainbow.md)
- [LED - Digital Clock](https://github.com/rwaldron/johnny-five/blob/master/docs/led-digits-clock.md)
- [LED - Digital Clock, HT16K33](https://github.com/rwaldron/johnny-five/blob/master/docs/led-digits-clock-HT16K33.md)
- [LED - Digital Clock, Dual Displays](https://github.com/rwaldron/johnny-five/blob/master/docs/led-digits-clock-dual.md)
- [LED - Matrix](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix.md)
- [LED - Matrix Demo](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix-tutorial.md)
- [LED - Matrix HT16K33](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix-HT16K33.md)
- [LED - Matrix HT16K33 16x8](https://github.com/rwaldron/johnny-five/blob/master/docs/led-matrix-HT16K33-16x8.md)
- [LED - Draw Matrix Characters Demo](https://github.com/rwaldron/johnny-five/blob/master/docs/led-chars-demo.md)
- [LED - Enumerate Matrix Characters & Symbols](https://github.com/rwaldron/johnny-five/blob/master/docs/led-enumeratechars.md)

### Servo
- [Servo](https://github.com/rwaldron/johnny-five/blob/master/docs/servo.md)
- [Servo - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-PCA9685.md)
- [Servo - Continuous](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-continuous.md)
- [Servo - Slider control](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-slider.md)
- [Servo - Prompt](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-prompt.md)
- [Servo - Drive](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-drive.md)
- [Servo - Sweep](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-sweep.md)
- [Servo - Array of servos](https://github.com/rwaldron/johnny-five/blob/master/docs/servo-array.md)

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
- [Motor - Directional](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-directional.md)
- [Motor - Brake](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-brake.md)
- [Motor - Current](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-current.md)
- [Motor - H-Bridge](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-hbridge.md)
- [Motor - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-PCA9685.md)
- [Motor - LUDUS](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-LUDUS.md)
- [Motor - 3 pin](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-3-pin.md)
- [Motor - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_EV3.md)
- [Motor - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_NXT.md)

### Stepper Motor
- [Stepper - Driver](https://github.com/rwaldron/johnny-five/blob/master/docs/stepper-driver.md)
- [Stepper - Sweep](https://github.com/rwaldron/johnny-five/blob/master/docs/stepper-sweep.md)

### ESC & Brushless Motor
- [ESC - Keypress](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-keypress.md)
- [ESC - Dualshock](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-dualshock.md)
- [ESC - PCA9685](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-PCA9685.md)
- [ESC - Bidirectional](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-bidirectional.md)
- [ESC - Bidirectional Forward-Reverse](https://github.com/rwaldron/johnny-five/blob/master/docs/esc-bidirectional-forward-reverse.md)

### Button / Switch
- [Button](https://github.com/rwaldron/johnny-five/blob/master/docs/button.md)
- [Button - Bumper](https://github.com/rwaldron/johnny-five/blob/master/docs/button-bumper.md)
- [Button - Options](https://github.com/rwaldron/johnny-five/blob/master/docs/button-options.md)
- [Button - Pullup](https://github.com/rwaldron/johnny-five/blob/master/docs/button-pullup.md)
- [Toggle Switch](https://github.com/rwaldron/johnny-five/blob/master/docs/toggle-switch.md)
- [Button - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_EV3.md)
- [Button - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_NXT.md)

### Keypad
- [Keypad - VKEY](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-analog-vkey.md)
- [Keypad - Waveshare AD](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-analog-ad.md)
- [Keypad - MPR121](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-MPR121.md)
- [Keypad - MPR121QR2](https://github.com/rwaldron/johnny-five/blob/master/docs/keypad-MPR121QR2.md)

### Relay
- [Relay](https://github.com/rwaldron/johnny-five/blob/master/docs/relay.md)

### Shift Register
- [Shift Register](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register.md)
- [Shift Register - Seven segment controller](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register-seven-segment.md)
- [Shift Register - Seven segments, daisy chained](https://github.com/rwaldron/johnny-five/blob/master/docs/shift-register-daisy-chain.md)

### Infrared Reflectance)
- [IR Motion](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-motion.md)
- [IR Proximity](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-proximity.md)
- [IR Reflectance](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-reflect.md)
- [IR Reflectance Array](https://github.com/rwaldron/johnny-five/blob/master/docs/ir-reflect-array.md)

### Proximity
- [Proximity](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity.md)
- [Proximity - GP2Y0A710K0F](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-GP2Y0A710K0F.md)
- [Proximity - SRF10](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-srf10.md)
- [Proximity - MB1000](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1000.md)
- [Proximity - MB1010](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1010.md)
- [Proximity - MB1003](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1003.md)
- [Proximity - MB1230](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-mb1230.md)
- [Proximity - HC-SR04](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-hcsr04.md)
- [Proximity - LIDAR-Lite](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-lidarlite.md)
- [Proximity - EVShield EV3 (IR)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_IR.md)
- [Proximity - EVShield EV3 (Ultrasonic)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_US.md)
- [Proximity - EVShield EV3 (IR)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_IR-alert.md)
- [Proximity - EVShield EV3 (Ultrasonic)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_US-alert.md)

### Motion
- [Motion](https://github.com/rwaldron/johnny-five/blob/master/docs/motion.md)
- [Motion - GP2Y0D805Z0F](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-gp2y0d805z0f.md)
- [Motion - GP2Y0D810Z0F](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-gp2y0d810z0f.md)
- [Motion - GP2Y0D810Z0F](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-gp2y0d815z0f.md)
- [Motion - GP2Y0A60SZLF](https://github.com/rwaldron/johnny-five/blob/master/docs/motion-GP2Y0A60SZLF.md)

### Joystick
- [Joystick](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick.md)
- [Joystick - Esplora](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick-esplora.md)
- [Joystick - Sparkfun Shield](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick-shield.md)
- [Joystick - Pan + Tilt control](https://github.com/rwaldron/johnny-five/blob/master/docs/joystick-pantilt.md)

### LCD
- [LCD](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd.md)
- [LCD - Enumerate characters](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-enumeratechars.md)
- [LCD - Runner 20x4](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-runner-20x4.md)
- [LCD - Runner 16x2](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-runner.md)
- [LCD - I2C](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-i2c.md)
- [LCD - I2C PCF8574](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-i2c-PCF8574.md)
- [LCD - I2C Runner](https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-i2c-runner.md)

### Compass/Magnetometer
- [Compass / Magnetometer](https://github.com/rwaldron/johnny-five/blob/master/docs/magnetometer.md)
- [Compass - HMC6352](https://github.com/rwaldron/johnny-five/blob/master/docs/compass-hmc6352.md)
- [Compass - HMC5883L](https://github.com/rwaldron/johnny-five/blob/master/docs/compass-hmc5883l.md)
- [Compass - Logger](https://github.com/rwaldron/johnny-five/blob/master/docs/magnetometer-log.md)
- [Compass - Find north](https://github.com/rwaldron/johnny-five/blob/master/docs/magnetometer-north.md)

### Piezo
- [Piezo](https://github.com/rwaldron/johnny-five/blob/master/docs/piezo.md)

### IMU/Multi
- [IMU - MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/imu-mpu6050.md)
- [Multi - MPL115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-mpl115a2.md)
- [Multi - BMP180](https://github.com/rwaldron/johnny-five/blob/master/docs/multi-bmp180.md)

### Sensors
- [Sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor.md)
- [Sensor - Slide potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor-slider.md)
- [Sensor - Force sensitive resistor](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor-fsr.md)
- [Sensor - Photoresistor](https://github.com/rwaldron/johnny-five/blob/master/docs/photoresistor.md)
- [Sensor - Potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/potentiometer.md)
- [Sensor - Microphone](https://github.com/rwaldron/johnny-five/blob/master/docs/microphone.md)
- [Accelerometer](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer.md)
- [Accelerometer - ADXL345](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-adxl345.md)
- [Accelerometer - ADXL335](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-adxl335.md)
- [Accelerometer - MMA7361](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-mma7361.md)
- [Accelerometer - MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-mpu6050.md)
- [Accelerometer - Pan + Tilt](https://github.com/rwaldron/johnny-five/blob/master/docs/accelerometer-pan-tilt.md)
- [Gyro](https://github.com/rwaldron/johnny-five/blob/master/docs/gyro.md)
- [Gyro - Analog LPR5150AL](https://github.com/rwaldron/johnny-five/blob/master/docs/gyro-lpr5150l.md)
- [Gyro - I2C MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/gyro-mpu6050.md)
- [Temperature - TMP36](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-tmp36.md)
- [Temperature - TMP102](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-tmp102.md)
- [Temperature - LM35](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-lm35.md)
- [Temperature - LM335](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-lm335.md)
- [Temperature - DS18B20](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-ds18b20.md)
- [Temperature - MPU6050](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-mpu6050.md)
- [Barometer - MPL115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/barometer-mpl115a2.md)
- [Temperature - MPL115A2](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-mpl115a2.md)
- [Barometer - BMP180](https://github.com/rwaldron/johnny-five/blob/master/docs/barometer-BMP180.md)
- [Temperature - BMP180](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-BMP180.md)
- [Temperature - SI7020](https://github.com/rwaldron/johnny-five/blob/master/docs/temperature-SI7020.md)

### Photon Weather Shield
- [Photon Weather Shield: Moisture](https://github.com/rwaldron/johnny-five/blob/master/docs/sensor-photon-weather-shield-moisture.md)

### Lego EVShield
- [Button - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_EV3.md)
- [Button - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/button-EVS_NXT.md)
- [Color - EVShield EV3 (Code)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-EVS_EV3.md)
- [Color - EVShield EV3 (Raw)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-raw-EVS_EV3.md)
- [Color - EVShield NXT (Code)](https://github.com/rwaldron/johnny-five/blob/master/docs/color-EVS_NXT.md)
- [Light - EVShield EV3 (Ambient)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-ambient-EVS_EV3.md)
- [Light - EVShield NXT (Ambient)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-ambient-EVS_NXT.md)
- [Light - EVShield EV3 (Reflected)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-reflected-EVS_EV3.md)
- [Light - EVShield NXT (Reflected)](https://github.com/rwaldron/johnny-five/blob/master/docs/light-reflected-EVS_NXT.md)
- [Motor - EVShield EV3](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_EV3.md)
- [Motor - EVShield NXT](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-EVS_NXT.md)
- [Proximity - EVShield EV3 (IR)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_IR-alert.md)
- [Proximity - EVShield EV3 (Ultrasonic)](https://github.com/rwaldron/johnny-five/blob/master/docs/proximity-EVS_EV3_US-alert.md)

### Intel Edison + Grove IoT Kit
- [Intel Edison + Grove - Accelerometer (ADXL346)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-accelerometer-adxl345-edison.md)
- [Intel Edison + Grove - Accelerometer (MMA7660)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-accelerometer-mma7660-edison.md)
- [Intel Edison + Grove - Barometer (BMP180)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-barometer-edison.md)
- [Intel Edison + Grove - Compass (HMC588L)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-compass-edison.md)
- [Intel Edison + Grove - Flame Sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-flame-sensor-edison.md)
- [Intel Edison + Grove - LED](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-led-edison.md)
- [Intel Edison + Grove - Light Sensor (TSL2561)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-light-sensor-edison.md)
- [Intel Edison + Grove - Button](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-button-edison.md)
- [Intel Edison + Grove - Moisture Sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-moisture-edison.md)
- [Intel Edison + Grove - Gas (MQ2)](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-gas-mq2-edison.md)
- [Intel Edison + Grove - Air quality sensor](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-gas-tp401-edison.md)
- [Intel Edison + Grove - Joystick](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-joystick-edison.md)
- [Intel Edison + Grove - Rotary Potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-rotary-potentiometer-edison.md)
- [Intel Edison + Grove - RGB LCD](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb-edison.md)
- [Intel Edison + Grove - LCD RGB temperature display](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb-temperature-display-edison.md)
- [Intel Edison + Grove - Relay](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-relay-edison.md)
- [Intel Edison + Grove - Servo](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-servo-edison.md)
- [Intel Edison + Grove - Touch](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-touch-edison.md)

### Grove IoT Kit (Seeed Studio)
- [Grove - LED](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-led.md)
- [Grove - Button](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-button.md)
- [Grove - Touch](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-touch.md)
- [Grove - Joystick](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-joystick.md)
- [Grove - Rotary Potentiometer](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-rotary-potentiometer.md)
- [Grove - RGB LCD](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb.md)
- [Grove - LCD RGB temperature display](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-lcd-rgb-temperature-display.md)
- [Grove - Servo](https://github.com/rwaldron/johnny-five/blob/master/docs/grove-servo.md)

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
- [Wii Nunchuck](https://github.com/rwaldron/johnny-five/blob/master/docs/nunchuk.md)
- [Wii Classic Controller](https://github.com/rwaldron/johnny-five/blob/master/docs/classic-controller.md)

### Complete Bots / Projects
- [Line Follower](https://github.com/rwaldron/johnny-five/blob/master/docs/line-follower.md)
- [Motobot](https://github.com/rwaldron/johnny-five/blob/master/docs/motobot.md)
- [Navigator](https://github.com/rwaldron/johnny-five/blob/master/docs/navigator.md)
- [Nodebot](https://github.com/rwaldron/johnny-five/blob/master/docs/nodebot.md)
- [Whisker](https://github.com/rwaldron/johnny-five/blob/master/docs/whisker.md)
- [Phoenix Hexapod](https://github.com/rwaldron/johnny-five/blob/master/docs/phoenix.md)
- [BOE Bot](https://github.com/rwaldron/johnny-five/blob/master/docs/boe-test-servos.md)
- [Bug](https://github.com/rwaldron/johnny-five/blob/master/docs/bug.md)
- [Lynxmotion Biped BRAT](https://github.com/rwaldron/johnny-five/blob/master/docs/brat.md)
- [Robotic Claw](https://github.com/rwaldron/johnny-five/blob/master/docs/claw.md)
- [Kinect Robotic Arm Controller](https://github.com/rwaldron/johnny-five/blob/master/docs/kinect-arm-controller.md)
- [Laser Trip Wire](https://github.com/rwaldron/johnny-five/blob/master/docs/laser-trip-wire.md)
- [Radar](https://github.com/rwaldron/johnny-five/blob/master/docs/radar.md)

### Component Plugin Template
- [Example plugin](https://github.com/rwaldron/johnny-five/blob/master/docs/plugin.md)

### IO Plugins
- [Led Blink on Electric Imp](https://github.com/rwaldron/johnny-five/blob/master/docs/imp-io.md)
- [Led Blink on Spark Core](https://github.com/rwaldron/johnny-five/blob/master/docs/spark-io.md)
- [Led Blink on pcDuino3](https://github.com/rwaldron/johnny-five/blob/master/docs/pcduino-io.md)
- [Led Blink on Intel Galileo Gen 2](https://github.com/rwaldron/johnny-five/blob/master/docs/galileo-io.md)
- [Led Blink on Raspberry Pi](https://github.com/rwaldron/johnny-five/blob/master/docs/raspi-io.md)
- [Led Blink on Intel Edison Arduino Board](https://github.com/rwaldron/johnny-five/blob/master/docs/edison-io-arduino.md)
- [Led Blink on Intel Edison Mini Board](https://github.com/rwaldron/johnny-five/blob/master/docs/edison-io-miniboard.md)

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
