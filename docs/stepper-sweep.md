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
    pins: [ 11, 12 ]
  });

  function sweep() {
    // 200 stepsPerRev / 2 = 100 (180degree sweeps)
    stepper[ ++k % 2 === 0 ? "ccw" : "cw" ]().step(100, function() {
      sweep();
    });
  }

  sweep();
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
