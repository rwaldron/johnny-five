<!--remove-start-->

# Thermometer - MS5611

<!--remove-end-->






##### Thermometer - MS5611



![docs/breadboard/multi-MS5611.png](breadboard/multi-MS5611.png)<br>

Fritzing diagram: [docs/breadboard/multi-MS5611.fzz](breadboard/multi-MS5611.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-MS5611.js
```


```javascript
const {Board, Thermometer} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "MS5611"
  });

  thermometer.on("change", () => {
    console.log(`Thermometer
  celsius      : ${thermometer.celsius}
  fahrenheit   : ${thermometer.fahrenheit}
  kelvin       : ${thermometer.kelvin}
--------------------------------------`);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
