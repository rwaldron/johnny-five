<!--remove-start-->

# Joystick - Motor control



Run with:
```bash
node eg/joystick-motor-led.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
  board, joystick, motor, led;

board = new five.Board();

board.on("ready", function() {

  // Create a new `joystick` hardware instance.
  joystick = new five.Joystick({
    // Joystick pins are an array of pins
    // Pin orders:
    //   [ up, down, left, right ]
    //   [ ud, lr ]
    pins: ["A0", "A1"],
    freq: 25
  });

  // Attach a motor to PWM pin 5
  motor = new five.Motor({
    pin: 5
  });

  // Attach a led to PWM pin 9
  led = new five.Led({
    pin: 9
  });

  // Inject the hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    joystick: joystick,
    motor: motor,
    led: led
  });


  // Pushing the joystick to up position should start the motor,
  // releasing it will turn the motor off.
  joystick.on("axismove", function() {

    if (!motor.isOn && this.axis.y > 0.51) {
      motor.start();
    }

    if (motor.isOn && this.axis.y < 0.51) {
      motor.stop();
    }
  });

  // While the motor is on, blink the led
  motor.on("start", function() {
    // 250ms
    led.strobe(250);
  });

  motor.on("stop", function() {
    led.stop();
  });
});


// Schematic
// https://1965269182786388413-a-1802744773732722657-s-sites.googlegroups.com/site/parallaxinretailstores/home/2-axis-joystick/Joystick-6.png
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-Axis%20JoyStick_B%20Schematic.pdf

// Further Reading
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf

```


## Illustrations / Photos


### Breadboard for "Joystick - Motor control"



![docs/breadboard/joystick-motor-led.png](breadboard/joystick-motor-led.png)<br>

Fritzing diagram: [docs/breadboard/joystick-motor-led.fzz](breadboard/joystick-motor-led.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
