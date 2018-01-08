<!--remove-start-->

# Grove - RGB LCD temperature display

<!--remove-end-->






##### Breadboard for "Grove - RGB LCD temperature display"



![docs/breadboard/grove-lcd-rgb-temperature-display.png](breadboard/grove-lcd-rgb-temperature-display.png)<br>

Fritzing diagram: [docs/breadboard/grove-lcd-rgb-temperature-display.fzz](breadboard/grove-lcd-rgb-temperature-display.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/grove-lcd-rgb-temperature-display.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the Temperature sensor module
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
![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)
![Grove - Temperature Sensor](http://www.seeedstudio.com/wiki/images/thumb/b/b0/Temperature1.jpg/400px-Temperature1.jpg)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
