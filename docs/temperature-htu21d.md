<!--remove-start-->

# Temperature - HTU21D

<!--remove-end-->








Run with:
```bash
node eg/temperature-htu21d.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var temperature = new five.Temperature({
    controller: "HTU21D"
  });

  temperature.on("data", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

```








## Additional Notes
- [HTU21D - Humidity Sensor](https://www.adafruit.com/products/1899)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
