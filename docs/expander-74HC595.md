<!--remove-start-->

# Expander - 74HC595

<!--remove-end-->


Using an 74HC595 Expander as a Virtual Board (8 Pin Digital Output)





##### Breadboard for "Expander - 74HC595"



![docs/breadboard/expander-74HC595.png](breadboard/expander-74HC595.png)<br>

Fritzing diagram: [docs/breadboard/expander-74HC595.fzz](breadboard/expander-74HC595.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-74HC595.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var expander = new five.Expander({
    controller: "74HC595",
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  var virtual = new five.Board.Virtual(expander);
  var leds = new five.Leds({
    pins: [0, 1, 2, 3, 4, 5, 6, 7],
    board: virtual
  });

  leds.blink(500);
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
