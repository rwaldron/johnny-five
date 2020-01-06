<!--remove-start-->

# Thermometer - MCP9808

<!--remove-end-->






##### MCP9808



![docs/breadboard/temperature-MCP9808.png](breadboard/temperature-MCP9808.png)<br>

Fritzing diagram: [docs/breadboard/temperature-MCP9808.fzz](breadboard/temperature-MCP9808.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-MCP9808.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "MCP9808"
  });

  thermometer.on("change", () => {
    const {celsius, fahrenheit, kelvin} = thermometer;
    console.log("Thermometer");
    console.log("  celsius      : ", celsius);
    console.log("  fahrenheit   : ", fahrenheit);
    console.log("  kelvin       : ", kelvin);
    console.log("--------------------------------------");
  });
});

```


## Illustrations / Photos


##### MCP9808



![docs/breadboard/temperature-MCP9808-tessel.png](breadboard/temperature-MCP9808-tessel.png)<br>

Fritzing diagram: [docs/breadboard/temperature-MCP9808-tessel.fzz](breadboard/temperature-MCP9808-tessel.fzz)

&nbsp;






## Learn More

- [MCP9808 High Accuracy I2C Temperature Sensor Breakout Board](http://www.adafruit.com/products/1782)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
