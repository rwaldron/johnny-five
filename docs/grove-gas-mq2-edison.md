<!--remove-start-->

# Intel Edison + Grove - Gas (MQ2)

<!--remove-end-->


Using Johnny-Five with Grove's Gas MQ2 component on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run this example from the command line with:
```bash
node eg/grove-gas-mq2-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the MQ2 Gas (Combustible Gas/Smoke)
  // module into the Grove Shield's A0 jack
  var gas = new five.Sensor("A0");

  // Plug the Piezo module into the
  // Grove Shield's D6 jack.
  var alarm = new five.Piezo(6);

  gas.scale(0, 100).on("change", function() {
    if (this.value > 60) {
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
![Grove - Buzzer Module](http://www.seeedstudio.com/depot/images/107020000%201.jpg)
![Grove - Gas Module](http://www.seeedstudio.com/depot/images/product/Gas%20Sensor%20MQ.jpg)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
