<!--remove-start-->

# GPS - Sparkfun GP-20U7

<!--remove-end-->


When using GPS class with an Arduino (or similar microcontroller), be sure to upload the StandardFirmataPlus firmware to your board.





##### Breadboard for "GPS - Sparkfun GP-20U7"



![docs/breadboard/gps-GP-20U7.png](breadboard/gps-GP-20U7.png)<br>

Fritzing diagram: [docs/breadboard/gps-GP-20U7.fzz](breadboard/gps-GP-20U7.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/gps-GP-20U7.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var gps = new five.GPS({
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude data log it.
  // This will output zero until a valid
  // GPS position is detected.
  gps.on("data", function() {
    console.log("position");
    console.log("  latitude   : ", this.latitude);
    console.log("  longitude  : ", this.longitude);
    console.log("  altitude   : ", this.altitude);
    console.log("--------------------------------------");
  });
});

```









## Learn More

- [GPS Receiver - GP-20U7 (56 Channel)](https://www.sparkfun.com/products/13740)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
