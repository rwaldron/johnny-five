<!--remove-start-->

# GPS - SparkFun Venus GPS

<!--remove-end-->


When using GPS class with an Arduino (or similar microcontroller), be sure to upload the StandardFirmataPlus firmware to your board.





##### SparkFun Venus GPS


Example of SparkFun Venus GPS on serial.


![docs/breadboard/gps-sparkfun.png](breadboard/gps-sparkfun.png)<br>

Fritzing diagram: [docs/breadboard/gps-sparkfun.fzz](breadboard/gps-sparkfun.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/gps-adafruit.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  /*
   * This is the simplest initialization
   * We assume SW_SERIAL0 for the port
   */
  var gps = new five.GPS({
    breakout: "ADAFRUIT_ULTIMATE_GPS",
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude, course or speed change log it
  gps.on("change", function() {
    console.log("position");
    console.log("  latitude   : ", this.latitude);
    console.log("  longitude  : ", this.longitude);
    console.log("--------------------------------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->