<!--remove-start-->

# GPS - Adafruit Ultimate GPS Breakout

<!--remove-end-->


When using GPS class with an Arduino (or similar microcontroller), be sure to upload the StandardFirmataPlus firmware to your board.





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
const { Board, GPS } = require("johnny-five");
const board = new Board();

board.on("ready", () => {

  /*
   * This is the simplest initialization
   * We assume SW_SERIAL0 for the port
   */
  const gps = new GPS({
    breakout: "ADAFRUIT_ULTIMATE_GPS",
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude, course or speed change log it
  gps.on("change", position => {
    const {latitude, longitude} = position;
    console.log("GPS Position:");
    console.log("  latitude   : ", latitude);
    console.log("  longitude  : ", longitude);
    console.log("--------------------------------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
