<!--remove-start-->

# Motor - EVShield EV3

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/motor-EVS_EV3.js
```


```javascript
const {Board, Motor} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const motor = new Motor({
    controller: "EVS_EV3",
    pin: "BBM2",
  });

  board.wait(2000, () => {
    console.log("REVERSE");

    motor.rev();

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, motor.stop);
  });

  console.log("FORWARD");
  motor.fwd();
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/MwI_OzLn0ck" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
