<!--remove-start-->

# Thermometer - TMP36

<!--remove-end-->






##### Breadboard for "Thermometer - TMP36"



![docs/breadboard/temperature-tmp36.png](breadboard/temperature-tmp36.png)<br>

Fritzing diagram: [docs/breadboard/temperature-tmp36.fzz](breadboard/temperature-tmp36.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-tmp36.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "TMP36",
    pin: "A0"
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








## Additional Notes
- [TMP36 - Thermometer Sensor](https://www.sparkfun.com/products/10988)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
