<!--remove-start-->
# LED - RGB, anode

Run with:
```bash
node eg/led-rgb-anode.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var anode = new five.Led.RGB({
    pins: {
      red: 3,
      green: 5,
      blue: 6
    },
    isAnode: true
  });

  anode.blink();

  this.repl.inject({
    anode: anode
  });

});

```


## Breadboard/Illustration


![docs/breadboard/led-rgb-anode.png](breadboard/led-rgb-anode.png)
[docs/breadboard/led-rgb-anode.fzz](breadboard/led-rgb-anode.fzz)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
