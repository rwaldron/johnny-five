<!--remove-start-->

# LED - Slider

<!--remove-end-->


Controls the brightness of an LED by pairing it with a slider. Requires LED on pin that supports PWM (usually denoted by ~).





##### Breadboard for "LED - Slider"



![docs/breadboard/led-slider.png](breadboard/led-slider.png)<br>

Fritzing diagram: [docs/breadboard/led-slider.fzz](breadboard/led-slider.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-slider.js
```


```javascript
const {Board, Led, Sensor} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const slider = new Sensor("A0");
  const led = new Led(11);

  // Scale the sensor's value to the LED's brightness range
  slider.on("data", () => {
    led.brightness(slider.scaleTo([0, 255]));
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
