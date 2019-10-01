<!--remove-start-->

# Thermometer - Dual DS18B20

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/temperature-dual-ds18b20.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

const controller = "DS18B20";

board.on("ready", () => {
  // This requires OneWire support using the ConfigurableFirmata
  const thermometerA = new Thermometer({
    controller,
    pin: 2,
    address: 0x687f1fe
  });

  const thermometerB = new Thermometer({
    controller,
    pin: 2,
    address: 0x6893a41
  });

  thermometerA.on("change", () => {
    const {address, celsius, fahrenheit, kelvin} = thermometerA;
    console.log(`Thermometer A at address: 0x${address.toString(16)}`);
    console.log("  celsius      : ", celsius);
    console.log("  fahrenheit   : ", fahrenheit);
    console.log("  kelvin       : ", kelvin);
    console.log("--------------------------------------");
  });

  thermometerB.on("change", () => {
    const {address, celsius, fahrenheit, kelvin} = thermometerB;
    console.log(`Thermometer B at address: 0x${address.toString(16)}`);
    console.log("  celsius      : ", celsius);
    console.log("  fahrenheit   : ", fahrenheit);
    console.log("  kelvin       : ", kelvin);
    console.log("--------------------------------------");
  });
});


```








## Additional Notes
- [DS18B20 - Thermometer Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
