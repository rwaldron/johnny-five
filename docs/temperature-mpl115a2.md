<!--remove-start-->

# Thermometer - MPL115A2

<!--remove-end-->






##### MPL115A2



![docs/breadboard/multi-mpl115a2.png](breadboard/multi-mpl115a2.png)<br>

Fritzing diagram: [docs/breadboard/multi-mpl115a2.fzz](breadboard/multi-mpl115a2.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-mpl115a2.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "MPL115A2"
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
- [MPL115A2 - I2C Barometric Pressure/Thermometer Sensor](https://www.adafruit.com/product/992)


## Learn More

- [MPL115A2 - I2C Barometric Pressure/Temperature Sensor](https://www.adafruit.com/product/992)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
