<!--remove-start-->

# GPS - Default GPS

<!--remove-end-->








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
