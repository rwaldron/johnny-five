<!--remove-start-->

# Thermometer - MAX31850

<!--remove-end-->






##### Breadboard for "Thermometer - MAX31850"



![docs/breadboard/temperature-max31850k.png](breadboard/temperature-max31850k.png)<br>

Fritzing diagram: [docs/breadboard/temperature-max31850k.fzz](breadboard/temperature-max31850k.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-max31850k.js
```


```javascript
const {Board, Thermometer} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // This requires OneWire support using the ConfigurableFirmata
  const temperature = new Thermometer({
    controller: "MAX31850K",
    pin: 2
  });

  temperature.on("change", () => {
    console.log(`temperature at address: 0x${temperature.address.toString(16)}
  celsius      : ${temperature.celsius}
  fahrenheit   : ${temperature.fahrenheit}
  kelvin       : ${temperature.kelvin}
--------------------------------------`);
  });
});


```








## Additional Notes
- [MAX31850K - Thermocouple Amplifier](https://www.adafruit.com/products/1727)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
