<!--remove-start-->
# Servo - Prompt

Run with:
```bash
node eg/servo-prompt.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var readline = require("readline");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

five.Board().on("ready", function() {
  var servo = new five.Servo(10);

  rl.setPrompt("SERVO TEST (0-180)> ");
  rl.prompt();

  rl.on("line", function(line) {
    servo.to(+line.trim());
    rl.prompt();
  }).on("close", function() {
    process.exit(0);
  });
});

```


## Breadboard/Illustration


![docs/breadboard/servo-prompt.png](breadboard/servo-prompt.png)  
[(Fritzing diagram)](breadboard/servo-prompt.fzz)





<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
