<!--remove-start-->

# Expander - MUXSHIELD2, Digital Input and Output

<!--remove-end-->


Using a MUXSHIELD2 Expander as a Virtual Board. Displays pin state in console graph. (`npm install barcli`)





##### Breadboard for "Expander - MUXSHIELD2, Digital Input and Output"



![docs/breadboard/expander-MUXSHIELD2-mixed.png](breadboard/expander-MUXSHIELD2-mixed.png)<br>

Fritzing diagram: [docs/breadboard/expander-MUXSHIELD2-mixed.fzz](breadboard/expander-MUXSHIELD2-mixed.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-MUXSHIELD2-mixed.js
```


```javascript
const Barcli = require("barcli");
const {Board, Button, Expander, Led, Leds, Sensor } = require("johnny-five");
const board = new Board({
  repl: false,
  debug: false
});

board.on("ready", () => {
  const activeLed = {
    last: -1,
    next: -1,
  };

  const virtual = new Board.Virtual(
    new Expander("MUXSHIELD2")
  );

  const leds = new Leds(
    Array.from({ length: 16 }, (_, index) => {
      const bar = new Barcli({ label: `IO3-${index}`, range: [0, 1] });
      const lit = new Sensor({
        type: "digital",
        pin: `IO3-${index}`,
        board: virtual,
      });

      const led = new Led({
        pin: `IO1-${index}`,
        board: virtual,
      });

      lit.on("data", () => {
        if (index === activeLed.last ||
            index === activeLed.next) {
          bar.update(lit.value);
        }
      });

      return led;
    })
  );

  const button = new Button(9);

  button.on("press", () => {
    activeLed.last = activeLed.next;

    if (activeLed.last !== -1) {
      leds[activeLed.last].off();
    }

    activeLed.next++;

    if (activeLed.next > 15) {
      activeLed.last = 15;
      activeLed.next = 0;
    }

    leds.off();
    leds[activeLed.next].on();
  });
});

```


## Illustrations / Photos


### Example output



![docs/images/expander-MUXSHIELD2-mixed-console-graph.png](images/expander-MUXSHIELD2-mixed-console-graph.png)  






&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
