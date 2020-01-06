<!--remove-start-->

# TinkerKit - Joystick

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/tinkerkit-joystick.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var joystick = new five.Joystick({
    pins: ["I0", "I1"],
  });

  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
    console.log("--------------------------------------");
  });
});

```









## Learn More

- [TinkerKit JoyStick](http://tinkerkit.tihhs.nl/joystick/)

- [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
