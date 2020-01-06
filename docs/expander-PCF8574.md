<!--remove-start-->

# Expander - PCF8574

<!--remove-end-->


Using an PCF8574 Expander as a Virtual Board (WaveShare 8 Pin Digital IO)





##### Breadboard for "Expander - PCF8574"



![docs/breadboard/expander-PCF8574.png](breadboard/expander-PCF8574.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCF8574.fzz](breadboard/expander-PCF8574.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-PCF8574.js
```


```javascript
const { Board, Expander, Leds } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("PCF8574")
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
