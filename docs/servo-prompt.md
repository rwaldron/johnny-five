<!--remove-start-->

# Servo - Prompt

<!--remove-end-->






##### Servo on pin 10


Servo connected to pin 10. Requires servo on pin that supports PWM (usually denoted by ~).


![docs/breadboard/servo.png](breadboard/servo.png)<br>

Fritzing diagram: [docs/breadboard/servo.fzz](breadboard/servo.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/servo-prompt.js
```


```javascript
const {Board, Servo} = require("johnny-five");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const board = new Board();

board.on("ready", () => {
  const servo = new Servo(10);

  rl.setPrompt("SERVO TEST (0-180)> ");
  rl.prompt();

  rl.on("line", (line) => {
    servo.to(+line.trim());
    rl.prompt();
  }).on("close", () => process.exit(0));
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
