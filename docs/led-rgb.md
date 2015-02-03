<!--remove-start-->
# RGB Component

Run with:
```bash
node eg/led-rgb.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");


five.Board().on("ready", function() {

  // Initialize the RGB LED
  var led = new five.Led.RGB({
    pins: {
      red: 3,
      green: 5,
      blue: 6
    }
  });

  // RGB LED alternate constructor
  // This will normalize an array of pins in [r, g, b]
  // order to an object (like above) that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  //var led = new five.Led.RGB([3,5,6]);

  // Add led to REPL (optional)
  this.repl.inject({
    led: led
  });

  // Turn it on and set the initial color
  led.on();
  led.color("#FF0000");

  led.blink(1000);

});

```


## Breadboard/Illustration


![docs/breadboard/led-rgb.png](breadboard/led-rgb.png)
[docs/breadboard/led-rgb.fzz](breadboard/led-rgb.fzz)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
