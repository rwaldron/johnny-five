<!--remove-start-->

# ESC - Dualshock controlled ESCs

<!--remove-end-->






##### Breadboard for "ESC - Dualshock controlled ESCs"



![docs/breadboard/esc-dualshock.png](breadboard/esc-dualshock.png)<br>

Fritzing diagram: [docs/breadboard/esc-dualshock.fzz](breadboard/esc-dualshock.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/esc-dualshock.js
```


```javascript
const {Board, ESC, Fn} = require('johnny-five');
const dualShock = require('dualshock-controller');

const board = new Board();
const controller = dualShock({
  config: 'dualShock3',
  analogStickSmoothing: false,
});

board.on('ready', () => {
  const esc = new ESC(9);
  let speed = 0;
  let last = null;

  controller.on('connected', () => {
    controller.isConnected = true;
  });

  controller.on('dpadUp:press', () => {
    if (last !== 'up') {
      speed = 0;
    } else {
      speed += 1;
    }
    esc.throttle(esc.neutral + speed);
    last = 'up';
  });

  controller.on('dpadDown:press', () => {
    if (last !== 'down') {
      speed = 0;
    } else {
      speed += 1;
    }
    esc.throttle(esc.neutral - speed);
    last = 'down';
  });

  controller.on('circle:press', () => {
    last = null;
    speed = 0;
    esc.brake();
  });

  controller.on('right:move', position => {
    const y = Fn.scale(position.y, 255, 0, 0, 180) | 0;

    if (y > 100) {
      // from the deadzone and up
      esc.throttle(scale(y, 100, 180, 0, 100));
    }
  });

  controller.connect();
});

// Brushless motor breadboard diagram originally published here:
// http://robotic-controls.com/learn/projects/dji-esc-and-brushless-motor

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
