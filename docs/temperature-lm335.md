<!--remove-start-->

# Thermometer - LM335

<!--remove-end-->






##### Breadboard for "Thermometer - LM335"



![docs/breadboard/temperature-lm335.png](breadboard/temperature-lm335.png)<br>

Fritzing diagram: [docs/breadboard/temperature-lm335.fzz](breadboard/temperature-lm335.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-lm335.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "LM335",
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
- [LM335 - Thermometer Sensor](http://www.ti.com/product/lm335)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
