<!--remove-start-->

# LED - RGB Intensity

<!--remove-end-->


Demonstrates changing intensity of an RGB LED. Requires RGB LED on pins that support PWM (usually denoted by ~).





##### RGB LED. (Arduino UNO)


Basic example with RGB LED connected to pins 6, 5, and 3 for red, green, and blue respectively.


![docs/breadboard/led-rgb.png](breadboard/led-rgb.png)<br>

Fritzing diagram: [docs/breadboard/led-rgb.fzz](breadboard/led-rgb.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-rgb-intensity.js
```


```javascript
var temporal = require("temporal");
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Initialize the RGB LED
  var led = new five.Led.RGB([6, 5, 3]);

  // Set to full intensity red
  console.log("100% red");
  led.color("#FF0000");

  temporal.queue([
    {
      // After 3 seconds, dim to 30% intensity
      wait: 3000,
      task: function() {
        console.log("30% red");
        led.intensity(30);
      }
    },
    {
      // 3 secs then turn blue, still 30% intensity
      wait: 3000,
      task: function() {
        console.log("30% blue");
        led.color("#0000FF");
      }
    },
    {
      // Another 3 seconds, go full intensity blue
      wait: 3000,
      task: function() {
        console.log("100% blue");
        led.intensity(100);
      }
    },
  ]);
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
