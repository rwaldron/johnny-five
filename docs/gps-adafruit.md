<!--remove-start-->

# GPS - Adafruit Ultimate GPS Breakout

<!--remove-end-->






##### Adafruit Ultimate GPS Breakout


Example of Adafruit Ultimate GPS on serial.


![docs/breadboard/gps-adafruit.png](breadboard/gps-adafruit.png)<br>

Fritzing diagram: [docs/breadboard/gps-adafruit.fzz](breadboard/gps-adafruit.fzz)

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
      tx: 10,
      rx: 11
    }
  });

  // If lat, long, course or speed change log it
  gps.on("change", function() {
    console.log(this.latitude, this.longitude);
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
