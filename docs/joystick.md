<!--remove-start-->

# Joystick

<!--remove-end-->






##### Joystick - Sparkfun


Sparkfun joystick breakout board.


![docs/breadboard/joystick-sparkfun.png](breadboard/joystick-sparkfun.png)<br>

Fritzing diagram: [docs/breadboard/joystick-sparkfun.fzz](breadboard/joystick-sparkfun.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/joystick.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `joystick` hardware instance.
  var joystick = new five.Joystick({
    //   [ x, y ]
    pins: ["A0", "A1"]
  });

  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
    console.log("--------------------------------------");
  });
});

```


## Illustrations / Photos


##### Joystick - Adafruit


Adafruit joystick breakout board.


![docs/breadboard/joystick-adafruit.png](breadboard/joystick-adafruit.png)<br>

Fritzing diagram: [docs/breadboard/joystick-adafruit.fzz](breadboard/joystick-adafruit.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
