<!--remove-start-->

# LED - Matrix Demo

<!--remove-end-->






##### Breadboard for "LED - Matrix Demo"



![docs/breadboard/led-matrix-tutorial.png](breadboard/led-matrix-tutorial.png)<br>

Fritzing diagram: [docs/breadboard/led-matrix-tutorial.fzz](breadboard/led-matrix-tutorial.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-matrix-tutorial.js
```


```javascript
var temporal = require("temporal");
var readline = require("readline");
var five = require("johnny-five");
var board = new five.Board({
  repl: false
});

var CHARS = five.LedControl.MATRIX_CHARS;

board.on("ready", function() {
  var canWink = true;
  var output = "";
  var index = 0;

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var display = new five.Led.Matrix({
    pins: {
      data: 2,
      cs: 3,
      clock: 4,
    },
    devices: 2
  });

  display.on(0);
  display.on(1);

  function draw() {
    if (output.length) {

      if (CHARS[output]) {
        display.draw(0, CHARS[output]);

        output = 0;
        index = 0;
      } else {
        display.draw(0, output[index++]);
      }

      // Reached the end?
      if (index === output.length) {
        setTimeout(function() {
          canWink = true;
        }, 100);
        index = 0;
        return;
      }

      setTimeout(draw, 500);
    }
  }


  function winker() {
    var a = [0, 102, 102, 102, 0, 129, 66, 60];
    var b = [0, 96, 96, 102, 0, 129, 66, 60];

    if (canWink) {
      display.draw(1, a);
    }

    temporal.queue([{
      delay: 50,
      task: function() {
        if (canWink) {
          display.draw(1, b);
        }
      }
    }, {
      delay: 50,
      task: function() {
        if (canWink) {
          display.draw(1, a);
        }
      }
    }, {
      delay: 50,
      task: function() {
        if (canWink) {
          display.draw(1, b);
        }
      }
    }, {
      delay: 50,
      task: function() {
        if (canWink) {
          display.draw(1, a);
        }
        temporal.wait(4000, winker);
      }
    }]);
  }

  winker();

  rl.prompt();
  rl.on("line", function(text) {
    output = text;
    canWink = false;
    rl.prompt();
    draw();
  });

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
