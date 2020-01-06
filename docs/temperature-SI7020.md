<!--remove-start-->

# Thermometer - SI7020

<!--remove-end-->






##### Tessel with SI7020



![docs/breadboard/temperature-SI7020.png](breadboard/temperature-SI7020.png)<br>

Fritzing diagram: [docs/breadboard/temperature-SI7020.fzz](breadboard/temperature-SI7020.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-SI7020.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const Tessel = require("tessel-io");

const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "SI7020",
    port: "A"
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


##### Arduino with SI7020



![docs/breadboard/temperature-SI7020-uno.png](breadboard/temperature-SI7020-uno.png)<br>

Fritzing diagram: [docs/breadboard/temperature-SI7020-uno.fzz](breadboard/temperature-SI7020-uno.fzz)

&nbsp;






## Learn More

- [SI7020 - I2C Temperature Sensor](https://tessel.io/docs/climate)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
