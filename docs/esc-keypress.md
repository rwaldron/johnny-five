# Esc Keypress

Run with:
```bash
node eg/esc-keypress.js
```


```javascript
var five = require("johnny-five");
var keypress = require("keypress");

var board = new five.Board();

board.on("ready", function() {

  var esc = new five.ESC(12);

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
        esc.to(speed);
      }
    }
  }

  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

// Brushless motor breadboard diagram originally published here:
// http://robotic-controls.com/learn/projects/dji-esc-and-brushless-motor

```


## Breadboard/Illustration


![docs/breadboard/esc-keypress.png](breadboard/esc-keypress.png)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
