<!--remove-start-->

# Sensor

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/sensor.js
```


```javascript
const { Board, Sensor } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // Create a new generic sensor instance for
  // a sensor connected to an analog (ADC) pin
  const sensor = new Sensor("A0");

  // When the sensor value changes, log the value
  sensor.on("change", value => {
    console.log("Sensor: ");
    console.log("  value  : ", sensor.value);
    console.log("-----------------");
  });
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
