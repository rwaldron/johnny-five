<!--remove-start-->

# Expander - MCP23008


Using an MCP23008 Expander as a Virtual Board (8 Pin Digital IO)


Run with:
```bash
node eg/expander-MCP23008.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var expander = new five.Expander({
    controller: "MCP23008"
  });

  var virtual = new five.Board.Virtual({
    io: expander
  });

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i, board: virtual });
    })
  );

  leds.on();

  this.repl.inject({
    expander: expander,
    leds: leds
  });
});

```


## Illustrations / Photos


### Breadboard for "Expander - MCP23008"



![docs/breadboard/expander-MCP23008.png](breadboard/expander-MCP23008.png)<br>

Fritzing diagram: [docs/breadboard/expander-MCP23008.fzz](breadboard/expander-MCP23008.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
