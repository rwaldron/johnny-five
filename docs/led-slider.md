<!--remove-start-->
# LED - Slider Control

Run with:
```bash
node eg/led-slider.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

    var slider = new five.Sensor("A0");
    var led = new five.Led(11);

    // Scale the sensor's value to the LED's brightness range
    slider.scale([0, 255]).on("data", function() {
      led.brightness(this.value);
    });
  });
```


## Breadboard/Illustration


![docs/breadboard/led-slider.png](breadboard/led-slider.png)
[docs/breadboard/led-slider.fzz](breadboard/led-slider.fzz)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
