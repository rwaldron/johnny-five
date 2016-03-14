<!--remove-start-->

# GPS - Adafruit Ultimate GPS via Hardware Serial

<!--remove-end-->






##### Adafruit Ultimate GPS via Hardware Serial


Example of Adafruit Ultimate GPS on hardware serial.


![docs/breadboard/gps-hardware-serial.png](breadboard/gps-hardware-serial.png)<br>

Fritzing diagram: [docs/breadboard/gps-hardware-serial.fzz](breadboard/gps-hardware-serial.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/gps-hardware-serial.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  /*
   * Explicitly setting HW_SERIAL1 for the port
   */
  var gps = new five.GPS({
    port: "HW_SERIAL1"
  });

  // If lat, long, course or speed change log it
  gps.on("change", function(data) {
    console.log(data);
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
