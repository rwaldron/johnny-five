<!--remove-start-->

# ESC - Bidirectional

<!--remove-end-->






##### Breadboard for "ESC - Bidirectional"



![docs/breadboard/esc-bidirectional.png](breadboard/esc-bidirectional.png)<br>

Fritzing diagram: [docs/breadboard/esc-bidirectional.fzz](breadboard/esc-bidirectional.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/esc-bidirectional.js
```


```javascript
const { Board, Button, ESC, Sensor } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const esc = new ESC({
    device: "FORWARD_REVERSE",
    pin: 11
  });
  const throttle = new Sensor("A0");
  const brake = new Button(4);

  brake.on("press", () => esc.brake());

  throttle.on("change", () => {
    esc.throttle(throttle.scaleTo(esc.pwmRange));
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
