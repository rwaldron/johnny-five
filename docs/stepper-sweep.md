# Stepper Sweep

Run with:
```bash
node eg/stepper-sweep.js
```


```javascript
var five = require("../lib/johnny-five");

five.Board().on("ready", function() {
  var stepper, k = 0;

  stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: [11, 12]
  });

  // function sweep() {
  //   // 200 stepsPerRev / 2 = 100 (180degree sweeps)
  //   stepper[++k % 2 === 0 ? "ccw" : "cw"]().step(100, function() {
  //     sweep();
  //   });
  // }

  stepper.rpm(180).ccw().step(2000, function() {
    console.log("done");
  });

  this.repl.inject({
    stepper: stepper
  });



  // sweep();
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
