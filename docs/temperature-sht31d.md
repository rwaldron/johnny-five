<!--remove-start-->

# Thermometer - SHT31D

<!--remove-end-->






##### SHT31D



![docs/breadboard/humidity-sht31d.png](breadboard/humidity-sht31d.png)<br>

Fritzing diagram: [docs/breadboard/humidity-sht31d.fzz](breadboard/humidity-sht31d.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-sht31d.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "SHT31D"
  });

  temperature.on("data", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
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
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
