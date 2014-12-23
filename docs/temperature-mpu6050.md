# Temperature Mpu6050

Run with:
```bash
node eg/temperature-mpu6050.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var temperature = new five.Temperature({
    controller: "MPU6050"
  });

  temperature.on("change", function() {
    console.log("temperature");
    console.log("  celsius      : ", this.celsius);
    console.log("  fahrenheit   : ", this.fahrenheit);
    console.log("  kelvin       : ", this.kelvin);
    console.log("--------------------------------------");
  });
});

```


## Breadboard/Illustration


![docs/breadboard/temperature-mpu6050.png](breadboard/temperature-mpu6050.png)
[docs/breadboard/temperature-mpu6050.fzz](breadboard/temperature-mpu6050.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
