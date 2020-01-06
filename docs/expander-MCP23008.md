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
const { Board, Expander, Leds } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("MCP23008")
  );

  const leds = new Leds(
    Array.from(Array(8), (_, pin) =>
      ({ pin, board: virtual })
    )
  );

  leds.blink(500);

  board.repl.inject({
    leds
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
