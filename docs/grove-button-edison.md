<!--remove-start-->

# Intel Edison + Grove - Button

<!--remove-end-->


Using Johnny-Five with Grove's Button component on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run this example from the command line with:
```bash
node eg/grove-button-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Button module into the
  // Grove Shield's D4 jack
  var button = new five.Button(4);

  // Plug the LED module into the
  // Grove Shield's D6 jack. See
  // grove-led for more information.
  var led = new five.Led(6);

  // The following will turn the Led
  // on and off as the button is
  // pressed and released.
  button.on("press", function() {
    led.on();
  });

  button.on("release", function() {
    led.off();
  });
});

```








## Additional Notes
For this program, you'll need:
![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - LED Module](http://www.seeedstudio.com/depot/images/product/Red%20LED_02.jpg)
![Grove - Button Module](http://www.seeedstudio.com/depot/images/product/bgpushb1.jpg)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
