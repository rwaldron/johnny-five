<!--remove-start-->

# Motor - EVShield NXT

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/motor-EVS_NXT.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var motor = new five.Motor({
    controller: "EVS_NXT",
    pin: "BBM2",
  });

  board.wait(2000, function() {
    console.log("REVERSE");

    motor.rev();

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, function() {
      motor.stop();
    });
  });

  console.log("FORWARD");
  motor.fwd();
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/WLMTxiHOWHM" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
