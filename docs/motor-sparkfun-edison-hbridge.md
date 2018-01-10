<!--remove-start-->

# Motor - Sparkfun Dual H-bridge Edison Block

<!--remove-end-->






##### Breadboard for "Motor - Sparkfun Dual H-bridge Edison Block"



![docs/breadboard/motor-sparkfun-edison-hbridge.png](breadboard/motor-sparkfun-edison-hbridge.png)<br>

Fritzing diagram: [docs/breadboard/motor-sparkfun-edison-hbridge.fzz](breadboard/motor-sparkfun-edison-hbridge.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/motor-sparkfun-edison-hbridge.js
```


```javascript
var five = require("johnny-five");
var Edison = require("galileo-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var config = five.Motor.SHIELD_CONFIGS.SPARKFUN_DUAL_HBRIDGE_EDISON_BLOCK;
  var motor = new five.Motor(config.B);

  board.repl.inject({
    motor: motor
  });

  motor.on("stop", function() {
    console.log("automated stop on timer", Date.now());
  });

  motor.on("forward", function() {
    console.log("forward", Date.now());

    // enable the motor after 2 seconds
    board.wait(2000, function() {
      motor.enable();
    });
  });

  motor.on("enable", function() {
    console.log("motor enabled", Date.now());

    // enable the motor after 2 seconds
    board.wait(2000, function() {
      motor.stop();
    });
  });

  motor.on("disable", function() {
    console.log("motor disabled", Date.now());
  });


  // // disable the motor
  motor.disable();

  // set the motor going forward full speed (nothing happen)
  motor.forward(255);
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
