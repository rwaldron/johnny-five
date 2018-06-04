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
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var thermometer = new five.Thermometer({
    controller: "HTU21D"
  });

  thermometer.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
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
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
