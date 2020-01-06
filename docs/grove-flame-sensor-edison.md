<!--remove-start-->

# Intel Edison + Grove - Flame Sensor

<!--remove-end-->


Using Johnny-Five with Grove's Flame Sensor component on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run this example from the command line with:
```bash
node eg/grove-flame-sensor-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Flame Detector Sensor into D4
  var flame = new five.Sensor.Digital(4);

  // Plug the Piezo module into the
  // Grove Shield's D6 jack.
  var alarm = new five.Piezo(6);

  flame.on("change", function() {
    if (this.value) {
      if (!alarm.isPlaying) {
        alarm.frequency(five.Piezo.Notes.d5, 5000);
      }
    }
  });
});

```








## Additional Notes
For this program, you'll need:
![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - Flame Detector Sensor](http://www.seeedstudio.com/depot/images/product/Flame%20Sensor.jpg)
- [Grove - Flame Detector Sensor](http://www.seeedstudio.com/depot/Grove-Flame-Sensor-p-1450.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
