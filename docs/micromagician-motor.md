<!--remove-start-->

# Micro Magician V2 - Motor

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/micromagician-motor.js
```


```javascript
var five = require("johnny-five");

var board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `motor` hardware instance.
  var motorA = new five.Motor(five.Motor.SHIELD_CONFIGS.MICRO_MAGICIAN_V2.A);
  var motorB = new five.Motor(five.Motor.SHIELD_CONFIGS.MICRO_MAGICIAN_V2.B);

  // Inject the `motor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    motorA: motorA,
    motorB: motorB,
  });

  // "start" events fire when the motor is started.
  motorA.on("start", function() {
    console.log("start");

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, function() {
      motorA.stop();
    });
  });

  // "stop" events fire when the motor is stopped.
  motorA.on("stop", function() {
    console.log("stop");
  });

  // Motor API
  motorA.start();


});

```









## Learn More

- [Micro Magician V2](http://www.dagurobot.com/goods.php?id=137)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
