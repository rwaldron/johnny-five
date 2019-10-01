<!--remove-start-->

# Intel Edison + Grove - RGB LCD temperature display

<!--remove-end-->


Using Johnny-Five with Grove's RGB LCD and Thermometer components on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run this example from the command line with:
```bash
node eg/grove-lcd-rgb-temperature-display-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Thermometer sensor module
  // into the Grove Shield's A0 jack
  var thermometer = new five.Thermometer({
    controller: "GROVE",
    pin: "A0"
  });

  // Plug the LCD module into any of the
  // Grove Shield's I2C jacks.
  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  var f = 0;

  thermometer.on("data", function() {

    // The LCD's background will change
    // color according to the temperature.
    //
    // Hot -> Warm: Red -> Yellow
    // Moderate: Green
    // Cool -> Cold: Blue -> Violet
    //
    // Experiment with sources of hot and
    // cold temperatures!
    //


    if (f === Math.round(this.fahrenheit)) {
      return;
    }

    f = Math.round(this.fahrenheit);

    var r = linear(0x00, 0xFF, f, 100);
    var g = linear(0x00, 0x00, f, 100);
    var b = linear(0xFF, 0x00, f, 100);

    // console.log("Fahrenheit:  %d°", f);

    lcd.bgColor(r, g, b).cursor(0, 0).print(f);
  });
});

// [Linear Interpolation](https://en.wikipedia.org/wiki/Linear_interpolation)
function linear(start, end, step, steps) {
  return (end - start) * step / steps + start;
}


```








## Additional Notes
For this program, you'll need:
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)
![Grove - Thermometer Sensor](http://www.seeedstudio.com/wiki/images/thumb/b/b0/Thermometer1.jpg/400px-Thermometer1.jpg)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
