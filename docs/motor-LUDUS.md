<!--remove-start-->

# Motor - LUDUS

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/motor-LUDUS.js
```


```javascript
const {Board, Motor, Motors} = require("johnny-five");
const keypress = require("keypress");
const board = new Board();

board.on("ready", () => {
  const motors = new Motors([
    Motor.SHIELD_CONFIGS.SPARKFUN_LUDUS.A, // Left
    Motor.SHIELD_CONFIGS.SPARKFUN_LUDUS.B, // Right
  ]);
  let speed = 100;

  function controller(ch, key) {
    if (key) {
      if (key.name === "space") {
        motors.stop();
      }
      if (key.name === "up") {
        motors.fwd(speed);
      }
      if (key.name === "down") {
        motors.rev(speed);
      }
      if (key.name === "right") {
        motors[0].fwd(speed * 0.75);
        motors[1].rev(speed * 0.75);
      }
      if (key.name === "left") {
        motors[0].rev(speed * 0.75);
        motors[1].fwd(speed * 0.75);
      }
    }
  }

  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
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
