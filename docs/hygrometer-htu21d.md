<!--remove-start-->

# Hygrometer - HTU21D

<!--remove-end-->






##### HTU21D



![docs/breadboard/humidity-htu21d.png](breadboard/humidity-htu21d.png)<br>

Fritzing diagram: [docs/breadboard/humidity-htu21d.fzz](breadboard/humidity-htu21d.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/hygrometer-htu21d.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "HTU21D"
  });

  hygrometer.on("data", function() {
    console.log(this.relativeHumidity + " %");
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
