<!--remove-start-->

# ESCs - An array of ESCs

<!--remove-end-->






##### Breadboard for "ESCs - An array of ESCs"



![docs/breadboard/esc-array.png](breadboard/esc-array.png)<br>

Fritzing diagram: [docs/breadboard/esc-array.fzz](breadboard/esc-array.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/esc-array.js
```


```javascript
const {Board, ESC} = require('johnny-five');
const board = new Board();

board.on('ready', () => {
  const escs = new ESC.Collection([9, 10]);

  // Set the motors to their max speed
  // This might be dangerous ¯\_(ツ)_/¯
  escs.throttle(100);

  board.wait(2000, esc.brake);
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
