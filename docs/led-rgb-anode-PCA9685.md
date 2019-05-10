<!--remove-start-->

# LED - RGB (Common Anode) PCA9685

<!--remove-end-->


Demonstrates use of an RGB LED (common anode) with the PCA9685 controller by setting its color to red (`#ff0000`) and making it blink.





##### Breadboard for "LED - RGB (Common Anode) PCA9685"



![docs/breadboard/led-rgb-anode-PCA9685.png](breadboard/led-rgb-anode-PCA9685.png)<br>

Fritzing diagram: [docs/breadboard/led-rgb-anode-PCA9685.fzz](breadboard/led-rgb-anode-PCA9685.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-rgb-anode-PCA9685.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Initialize the RGB LED
  var led = new five.Led.RGB({
    controller: "PCA9685",
    isAnode: true,
    pins: {
      red: 2,
      green: 1,
      blue: 0
    },
  });

  // RGB LED alternate constructor
  // This will normalize an array of pins in [r, g, b]
  // order to an object (like above) that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  // var led = new five.Led.RGB({
  //   pins: [2, 1, 0],
  //   isAnode: true,
  //   controller: "PCA9685"
  // });

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








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
