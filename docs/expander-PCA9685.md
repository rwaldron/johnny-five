<!--remove-start-->

# Expander - PCA9685

<!--remove-end-->


Using an PCA9685 Expander as a Virtual Board (Adafruit 16 Channel PWM Shield)





##### Breadboard for "Expander - PCA9685"



![docs/breadboard/expander-PCA9685.png](breadboard/expander-PCA9685.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCA9685.fzz](breadboard/expander-PCA9685.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-PCA9685.js
```


```javascript
const { Board, Expander, Leds } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("PCA9685")
  );

  const leds = new Leds(
    Array.from(Array(8), (_, i) =>
      ({ pin: i * 2, board: virtual })
    )
  );

  leds.pulse();

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
