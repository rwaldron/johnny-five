<!--remove-start-->
# ESC (PCA9685)

Run with:
```bash
node eg/esc-PCA9685.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var esc = new five.ESC({
    controller: "PCA9685",
    pin: 1
  });

  var pot = new five.Sensor("A0");

  pot.scale(0, 100).on("change", function() {
    esc.speed(this.value);
  });
});

```


## Breadboard/Illustration


![docs/breadboard/esc-PCA9685.png](breadboard/esc-PCA9685.png)  
[(Fritzing diagram)](breadboard/esc-PCA9685.fzz)





<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
