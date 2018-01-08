<!--remove-start-->

# ESC - Keypress controlled ESCs

<!--remove-end-->






##### Breadboard for "ESC - Keypress controlled ESCs"



![docs/breadboard/esc-keypress.png](breadboard/esc-keypress.png)<br>

Fritzing diagram: [docs/breadboard/esc-keypress.fzz](breadboard/esc-keypress.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/esc-keypress.js
```


```javascript
var five = require("johnny-five");
var keypress = require("keypress");
var board = new five.Board();

board.on("ready", function() {

  var esc = new five.ESC(9);

  // Hold shift+arrow-up, shift+arrow-down to incrementally
  // increase or decrease speed.

  function controller(ch, key) {
    var isThrottle = false;
    var speed = esc.last ? esc.speed : 0;

    if (key && key.shift) {
      if (key.name === "up") {
        speed += 0.01;
        isThrottle = true;
      }

      if (key.name === "down") {
        speed -= 0.01;
        isThrottle = true;
      }

      if (isThrottle) {
        esc.speed(speed);
      }
    }
  }

  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
