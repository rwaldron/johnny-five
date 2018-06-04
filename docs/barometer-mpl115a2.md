<!--remove-start-->

# Barometer - MPL115A2

<!--remove-end-->






##### MPL115A2



![docs/breadboard/multi-mpl115a2.png](breadboard/multi-mpl115a2.png)<br>

Fritzing diagram: [docs/breadboard/multi-mpl115a2.fzz](breadboard/multi-mpl115a2.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/barometer-mpl115a2.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Barometer({
    controller: "MPL115A2"
  });

  barometer.on("data", function() {
    console.log("Barometer");
    console.log("  pressure : ", this.pressure);
    console.log("--------------------------------------");
  });
});

```









## Learn More

- [MPL115A2 - I2C Barometric Pressure/Temperature Sensor](https://www.adafruit.com/product/992)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
