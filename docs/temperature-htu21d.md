<!--remove-start-->

# Thermometer - HTU21D

<!--remove-end-->






##### HTU21D



![docs/breadboard/humidity-htu21d.png](breadboard/humidity-htu21d.png)<br>

Fritzing diagram: [docs/breadboard/humidity-htu21d.fzz](breadboard/humidity-htu21d.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-htu21d.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "HTU21D"
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
- [HTU21D - Humidity Sensor](https://www.adafruit.com/products/1899)


## Learn More

- [HTU21D Humidity/Temperature Sensor](https://www.adafruit.com/products/1899)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
