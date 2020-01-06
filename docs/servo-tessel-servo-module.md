<!--remove-start-->

# Servo - Tessel Servo Module

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/servo-tessel-servo-module.js
```


```javascript
const {Board, Servo} = require("johnny-five");
const Tessel = require("tessel-io");

const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  console.log("Connected");

  // Initialize the servo instance
  const servo = new Servo({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pin: 1,
  });

  servo.sweep();
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
