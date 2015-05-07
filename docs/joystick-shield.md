<!--remove-start-->

# Joystick - Sparkfun Shield



Run with:
```bash
node eg/joystick-shield.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var joystick = new five.Joystick({
    pins: ["A0", "A1"],
    invertY: true
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


### Joystick - Sparkfun Shield


Sparkfun Joystick Shield example.


![docs/breadboard/joystick-shield.png](breadboard/joystick-shield.png)<br>

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
