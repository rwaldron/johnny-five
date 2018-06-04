<!--remove-start-->

# Switch - Tilt SW-200D

<!--remove-end-->






##### Breadboard for "Switch - Tilt SW-200D"



![docs/breadboard/switch-tilt-SW_200D.png](breadboard/switch-tilt-SW_200D.png)<br>

Fritzing diagram: [docs/breadboard/switch-tilt-SW_200D.fzz](breadboard/switch-tilt-SW_200D.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/switch-tilt-SW_200D.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();
var tilt;

board.on("ready", function() {
  tilt = new five.Button(2); // digital pin 2

  board.repl.inject({
    button: tilt
  });

  // tilt the breadboard to the right, towards to the ground pin
  tilt.on("down", function() {
    console.log("down");
  });

  // tilt and hold
  tilt.on("hold", function() {
    console.log("hold");
  });

  // tilt back the breadboard to the stable position
  tilt.on("up", function() {
    console.log("up");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
