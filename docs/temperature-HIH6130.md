<!--remove-start-->

# Thermometer - HIH6130

<!--remove-end-->






##### HIH6130



![docs/breadboard/multi-HIH6130.png](breadboard/multi-HIH6130.png)<br>

Fritzing diagram: [docs/breadboard/multi-HIH6130.fzz](breadboard/multi-HIH6130.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-HIH6130.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "HIH6130"
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









## Learn More

- [HIH6130 Humidity/Temperature Sensor](https://www.sparkfun.com/products/11295)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
