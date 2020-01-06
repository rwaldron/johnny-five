<!--remove-start-->

# Intel Edison + Grove - Barometer (BMP180)

<!--remove-end-->


Using Johnny-Five with Grove's Barometer (BMP180) component on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run this example from the command line with:
```bash
node eg/grove-barometer-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the BMP180 Barometer module
  // into an I2C jack
  var barometer = new five.Barometer({
    controller: "BMP180"
  });

  barometer.on("change", function() {
    console.log("Barometer");
    console.log("  pressure     : ", this.pressure);
    console.log("--------------------------------------");
  });
});

```








## Additional Notes
For this program, you'll need:
![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - Barometer Sensor (BMP180)](http://www.seeedstudio.com/depot/images/product/Grove%20Barometer%20Sensor%20BMP180.jpg)
- [Grove - Barometer Sensor (BMP180)](http://www.seeedstudio.com/depot/Grove-Barometer-Sensor-BMP180-p-1840.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
