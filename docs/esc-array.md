<!--remove-start-->

# ESC - ESC Array

<!--remove-end-->






##### Breadboard for "ESC - ESC Array"



![docs/breadboard/esc-array.png](breadboard/esc-array.png)<br>

Fritzing diagram: [docs/breadboard/esc-array.fzz](breadboard/esc-array.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/esc-array.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var escs = new five.ESCs([9, 10]);

  // Set the motors to their max speed
  escs.max();

  board.wait(2000, function() {
    // Set the motors to the min speed (stopped)
    escs.min();
  });

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
