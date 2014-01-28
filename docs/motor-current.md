# Motor Current

Run with:
```bash
node eg/motor-current.js
```


```javascript
var five = require("johnny-five"),
  board = new five.Board();

board.on("ready", function() {
  var motor;
  /*
    Arduino Motor Shield R3
      Motor A
        pwm: 3
        dir: 12
        brake: 9
        current: "A0"

      Motor B
        pwm: 11
        dir: 13
        brake: 8
        current: "A1"

   */

  motor = new five.Motor({
    pins: {
      pwm: 3,
      dir: 12,
      brake: 9
    },
    
    // The current options are passed to a new instance of Sensor
    current: {
      pin: "A0",
      freq: 250,
      range: [0, 2000],
      threshold: 50
    }
  });

  board.repl.inject({
    motor: motor
  });

  motor.current.scale([0, 2000]).on("data", function() {
    console.log("Motor A: " + this.value + "mA");
  });
  
  motor.on("start", function(err, timestamp) {
    console.log("start", timestamp);
  });

  motor.on("stop", function(err, timestamp) {
    console.log("automated stop on timer", timestamp);
  });

  motor.on("brake", function(err, timestamp) {
    console.log("automated brake on timer", timestamp);
  });
  
  motor.on("forward", function(err, timestamp) {
    console.log("forward", timestamp);

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, function() {
      motor.reverse(150);
    });
  });

  motor.on("reverse", function(err, timestamp) {
    console.log("reverse", timestamp);

    // demonstrate stopping after 5 seconds
    board.wait(5000, function() {
      
      // Apply the brake for 500ms and call stop()
      motor.brake(500);
    });
  });

  // set the motor going forward full speed
  motor.forward(255);
});

```


## Breadboard/Illustration


![docs/breadboard/motor-current.png](breadboard/motor-current.png)
[docs/breadboard/motor-current.fzz](breadboard/motor-current.fzz)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
