<!--remove-start-->

# Thermometer - MPU6050

<!--remove-end-->






##### Breadboard for "Thermometer - MPU6050"



![docs/breadboard/temperature-mpu6050.png](breadboard/temperature-mpu6050.png)<br>

Fritzing diagram: [docs/breadboard/temperature-mpu6050.fzz](breadboard/temperature-mpu6050.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-mpu6050.js
```


```javascript
const { Board, Thermometer } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "MPU6050"
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
- [MPU6050 - IMU with Thermometer Sensor](http://www.invensense.com/products/motion-tracking/6-axis/mpu-6050/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
