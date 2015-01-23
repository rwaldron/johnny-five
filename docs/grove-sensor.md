<!--remove-start-->
# Grove Sensor

Run with:
```bash
node eg/grove-sensor.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the Rotary Angle sensor module
  // into the Grove Shield's A0 jack
  var rotary = new five.Sensor("A0");

  // Plug the LED module into the
  // Grove Shield's D6 jack. See
  // grove-led for more information.
  var led = new five.Led(6);

  // Set scaling of the Rotary angle
  // sensor's output to 0-255 (8-bit)
  // range. Set the LED's brightness
  // based on the value of the sensor.
  rotary.scale(0, 255).on("change", function() {
    led.brightness(this.value);
  });
});


```





For this program, you'll need:

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - LED Module](http://www.seeedstudio.com/depot/images/product/Red%20LED_02.jpg)

![Grove - Rotary Angle Module](http://www.seeedstudio.com/depot/images/product/rotary.jpg)



<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
