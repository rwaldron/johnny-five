<!--remove-start-->

# Button - Pullup

<!--remove-end-->






##### Breadboard for "Button - Pullup"



![docs/breadboard/button-pullup.png](breadboard/button-pullup.png)<br>

Fritzing diagram: [docs/breadboard/button-pullup.fzz](breadboard/button-pullup.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/button-pullup.js
```


```javascript
// The `isPullup` button option enables the pullup
// resistor on the pin and automatically sets the
// `invert` option to true

// In this circuit configuration, the LED would always
// be on without the pullup resistor enabled

// For more info on pullup resistors, see:
// http://arduino.cc/en/Tutorial/InputPullupSerial
// http://arduino.cc/en/Tutorial/DigitalPins
// https://learn.sparkfun.com/tutorials/pull-up-resistors

var five = require("johnny-five"),
  button, led;

five.Board().on("ready", function() {

  button = new five.Button({
    pin: 2,
    isPullup: true
  });

  led = new five.Led(13);

  button.on("down", function(value) {
    led.on();
  });

  button.on("up", function() {
    led.off();
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
