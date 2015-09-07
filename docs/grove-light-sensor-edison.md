<!--remove-start-->

# Intel Edison + Grove - Light Sensor (TSL2561)

<!--remove-end-->


Using Johnny-Five with Grove's Light Sensor (TSL2561) component on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run with:
```bash
node eg/grove-light-sensor-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Grove TSL2561 Light sensor module
  // into an I2C jack
  var acceleration = new five.Light({
    controller: "TSL2561"
  });

  light.on("change", function() {
    console.log("Ambient Light Level: ", this.level);
  });
});

```








## Additional Notes
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - Digital Light Sensor](http://www.seeedstudio.com/depot/images/101020030%201.jpg)

- [Grove - Digital Light Sensor](http://www.seeedstudio.com/depot/Grove-Digital-Light-Sensor-p-1281.html)


&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
