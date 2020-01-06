<!--remove-start-->

# Intel Edison + Grove - Moisture Sensor

<!--remove-end-->


Using Johnny-Five with Grove's Moisture component on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run this example from the command line with:
```bash
node eg/grove-moisture-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Moisture module into the
  // Grove Shield's A0 jack
  var moisture = new five.Sensor("A0");

  // Plug the Relay module into the
  // Grove Shield's D6 jack.
  var relay = new five.Relay(6);

  moisture.scale(0, 100).on("change", function() {
    // 0 - Dry
    // 50 - Wet
    if (this.value < 20) {
      if (!relay.isOn) {
        // Turn on the water pump!
        relay.on();
      }
    } else {
      relay.off();
    }
  });
});

```








## Additional Notes
For this program, you'll need:
![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - Moisture Module](http://www.seeedstudio.com/depot/images/101020008%201.jpg)
![Grove - Relay Module](http://www.seeedstudio.com/depot/images/1030200051.jpg)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
