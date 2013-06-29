# Stepper control using four wire interface

Note about using the stepper functionality: The firmware support is not currently in StandardFirmata

AdvancedFirmata has the support for asynchronously controlling steppers: https://github.com/soundanalogous/AdvancedFirmata/


Run with:
```bash
node eg/stepper-four_wire.js
```


```javascript
var five = require("johnny-five");

var board = new five.Board();

board.on('ready', function() {
  var stepperConfig = {
    type: board.firmata.STEPPER.TYPE.FOUR_WIRE,
    stepsPerRev: 200,
    pins: {
      motor1: 10,
      motor2: 11,
      motor3: 12,
      motor4: 13
    }
  };

  var stepper = new five.Stepper(stepperConfig);

  // make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper.rpm(180).direction(board.firmata.STEPPER.DIRECTION.CCW).accel(1600).decel(1600).step(2000, function() {
    console.log("done moving CCW")
  });
})
```

## Breadboard/Illustration

![docs/breadboard/stepper-four_wire.png](breadboard/stepper-four_wire.png)
[docs/breadboard/stepper-four_wire.fzz](breadboard/stepper-four_wire.fzz)



## Devices



