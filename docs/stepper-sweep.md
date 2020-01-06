<!--remove-start-->

# Stepper - Sweep

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/stepper-sweep.js
```


```javascript
const {Board, Stepper} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  /**
   * In order to use the Stepper class, your board must be flashed with
   * either of the following:
   *
   * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
   * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
   *
   */

  const stepper = new Stepper({
    type: Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: [11, 12]
  });

  stepper.rpm(180).ccw().step(2000, () => console.log("done"));
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
