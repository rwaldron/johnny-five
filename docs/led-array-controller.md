<!--remove-start-->

# LEDs - Controlling an array of LEDs

<!--remove-end-->


Demonstrates controlling multiple LEDs at once through the use of an LED array and an analog Potentiometer.





##### Breadboard for "LEDs - Controlling an array of LEDs"



![docs/breadboard/led-array-controller.png](breadboard/led-array-controller.png)<br>

Fritzing diagram: [docs/breadboard/led-array-controller.fzz](breadboard/led-array-controller.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-array-controller.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var leds = new five.Leds([2, 3, 4, 5, 6]);
  var pot = new five.Sensor("A0");

  pot.scale([-1, 4]).on("change", function() {
    var lastIndex = Math.round(this.value);

    if (lastIndex === -1) {
      leds.off();
    } else {
      leds.each(function(led, index) {
        if (index <= lastIndex) {
          led.on();
        } else {
          led.off();
        }
      });
    }
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
