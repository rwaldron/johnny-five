<!--remove-start-->

# Grove - Joystick

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/grove-joystick.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the Joystick module into the
  // Grove Shield's A0 jack. Use
  // the Joystick class to control.
  var joystick = new five.Joystick(["A0", "A1"]);

  // Observe change events from the Joystick!
  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
    console.log("--------------------------------------");
  });
});


```








## Additional Notes
For this program, you'll need:
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - Joystick Module](http://www.seeedstudio.com/depot/images/product/bgjoy1.jpg)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
