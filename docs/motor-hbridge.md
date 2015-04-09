<!--remove-start-->

# Motor - H-Bridge





Run with:
```bash
node eg/motor-hbridge.js
```

<!--remove-end-->

```javascript
/*
  IMPORTANT!!! This example is not intended for off the shelf
  H-Bridge based motor controllers. It is for home made H-Bridge
  controllers. Off the shelf controllers abstract away the need
  to invert the PWM (AKA Speed) value when the direction pin is set
  to high. This is for controllers that do not have that feature.
*/

var five = require("johnny-five"),
  board = new five.Board();

board.on("ready", function() {
  var motor;
  /*
      Motor A
        pwm: 3
        dir: 12
   */


  motor = new five.Motor({
    pins: {
      pwm: 3,
      dir: 12
    },
    invertPWM: true
  });




  board.repl.inject({
    motor: motor
  });

  motor.on("start", function(err, timestamp) {
    console.log("start", timestamp);
  });

  motor.on("stop", function(err, timestamp) {
    console.log("automated stop on timer", timestamp);
  });

  motor.on("forward", function(err, timestamp) {
    console.log("forward", timestamp);

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, function() {
      motor.reverse(50);
    });
  });

  motor.on("reverse", function(err, timestamp) {
    console.log("reverse", timestamp);

    // demonstrate stopping after 5 seconds
    board.wait(5000, function() {
      motor.stop();
    });
  });

  // set the motor going forward full speed
  motor.forward(255);
});

```


## Illustrations / Photos


### Breadboard for "Motor - H-Bridge"



![docs/breadboard/motor-hbridge.png](breadboard/motor-hbridge.png)<br>

Fritzing diagram: [docs/breadboard/motor-hbridge.fzz](breadboard/motor-hbridge.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
