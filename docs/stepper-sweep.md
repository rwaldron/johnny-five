<!--remove-start-->
# Stepper - Sweep

Run with:
```bash
node eg/stepper-sweep.js
```
<!--remove-end-->

```javascript
var board = new five.Board();

board.on("ready", function() {
  var k = 0;
  var stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: [11, 12]
  });

  stepper.rpm(180).ccw().step(2000, function() {
    console.log("done");
  });
});

```








<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
