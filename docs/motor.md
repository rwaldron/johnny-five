# Motor

Run with:
```bash
node eg/motor.js
```


```javascript
var five = require('../lib/johnny-five.js');
var board, motor;

var PWM_LEFT = 11;
var L_MOTOR_DIR = 13;

board = new five.Board();

board.on('ready', function() {
    // simply goes forward for 5 seconds, reverse for 5 seconds then stops.
    motor = new five.Motor({
        pins: {
            motor: PWM_LEFT,
            dir: L_MOTOR_DIR
        }
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

    // set the motor going forward at speed 50
    motor.forward(50);
});

```

## Breadboard/Illustration

![docs/breadboard/motor.png](breadboard/motor.png)
[docs/breadboard/motor.fzz](breadboard/motor.fzz)



## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
