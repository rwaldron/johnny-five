<!--remove-start-->

# Expander - MCP23008

<!--remove-end-->


Using an MCP23008 Expander as a Virtual Board (8 Pin Digital IO)





##### Breadboard for "Expander - MCP23008"



![docs/breadboard/expander-MCP23008.png](breadboard/expander-MCP23008.png)<br>

Fritzing diagram: [docs/breadboard/expander-MCP23008.fzz](breadboard/expander-MCP23008.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-MCP23008.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("MCP23008")
  );

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i, board: virtual });
    })
  );

  leds.on();

  this.repl.inject({
    leds: leds
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
