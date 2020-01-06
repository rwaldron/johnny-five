<!--remove-start-->

# Hygrometer - SHT31D

<!--remove-end-->






##### SHT31D



![docs/breadboard/humidity-sht31d.png](breadboard/humidity-sht31d.png)<br>

Fritzing diagram: [docs/breadboard/humidity-sht31d.fzz](breadboard/humidity-sht31d.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/hygrometer-sht31d.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "SHT31D"
  });

  hygrometer.on("data", function() {
    console.log(this.relativeHumidity + " %");
  });
});


```








## Additional Notes
- [SHT31D - Humidity Sensor](https://www.adafruit.com/products/2857)


## Learn More

- [SHT31D Humidity/Temperature Sensor](https://www.adafruit.com/products/2857)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
