<!--remove-start-->

# ESC - Bidirectional Forward-Reverse

<!--remove-end-->






##### Breadboard for "ESC - Bidirectional Forward-Reverse"



![docs/breadboard/esc-bidirectional-forward-reverse.png](breadboard/esc-bidirectional-forward-reverse.png)<br>

Fritzing diagram: [docs/breadboard/esc-bidirectional-forward-reverse.fzz](breadboard/esc-bidirectional-forward-reverse.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/esc-bidirectional-forward-reverse.js
```


```javascript
const {Board, Button, ESC, Sensor} = require('johnny-five');
const board = new Board();

board.on('ready', () => {
  const start = Date.now();
  const esc = new ESC({
    device: 'FORWARD_REVERSE',
    neutral: 50,
    pin: 11,
  });
  const throttle = new Sensor('A0');
  const brake = new Button(4);

  brake.on('press', esc.brake);

  throttle.scale(0, 100).on('change', () => {
    // 2 Seconds for arming.
    if (Date.now() - start < 2000) {
      return;
    }

    esc.throttle(this.value);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
