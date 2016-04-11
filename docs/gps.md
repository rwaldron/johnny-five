<!--remove-start-->

# GPS - Default GPS

<!--remove-end-->


When using GPS class with an Arduino (or similar microcontroller), be sure to upload the StandardFirmataPlus firmware to your board.





##### Breadboard for "GPS - Default GPS"



![docs/breadboard/gps.png](breadboard/gps.png)<br>

Fritzing diagram: [docs/breadboard/gps.fzz](breadboard/gps.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/gps.js
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
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude change log it
  gps.on("change", function() {
    console.log("position");
    console.log("  latitude   : ", this.latitude);
    console.log("  longitude  : ", this.longitude);
    console.log("  altitude   : ", this.altitude);
    console.log("--------------------------------------");
  });
  // If speed, course change log it
  gps.on("navigation", function() {
    console.log("navigation");
    console.log("  speed   : ", this.speed);
    console.log("  course  : ", this.course);
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
