# Servo Prompt

Run with:
```bash
node eg/servo-prompt.js
```


```javascript
var five = require("johnny-five"),
  readline = require("readline");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

five.Board().on("ready", function() {

  var servo = new five.Servo(process.argv[2] || 10);

  rl.setPrompt("SERVO TEST (0-180)> ");
  rl.prompt();

  rl.on("line", function(line) {
    var pos = line.trim();
    servo.to(pos);
    rl.prompt();
  }).on("close", function() {
    process.exit(0);
  });

});

```


## Breadboard/Illustration


![docs/breadboard/servo-prompt.png](breadboard/servo-prompt.png)
[docs/breadboard/servo-prompt.fzz](breadboard/servo-prompt.fzz)





## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
