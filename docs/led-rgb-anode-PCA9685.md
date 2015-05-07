<!--remove-start-->

# LED - RGB (Common Anode) PCA9685


Demonstrates use of an RGB LED (common anode) using a PCA9685.


Run with:
```bash
node eg/led-rgb-anode-PCA9685.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");


five.Board().on("ready", function() {

  // Initialize the RGB LED
  var led = new five.Led.RGB({
    pins: {
      red: 2,
      green: 1,
      blue: 0
    },
    isAnode: true,
    controller: "PCA9685"
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


## Illustrations / Photos


### Breadboard for "LED - RGB (Common Anode) PCA9685"



![docs/breadboard/led-rgb-anode-PCA9685.png](breadboard/led-rgb-anode-PCA9685.png)<br>

Fritzing diagram: [docs/breadboard/led-rgb-anode-PCA9685.fzz](breadboard/led-rgb-anode-PCA9685.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
