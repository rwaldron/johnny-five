<!--remove-start-->

# Servo - PCA9685

<!--remove-end-->






##### Breadboard for "Servo - PCA9685"



![docs/breadboard/servo-PCA9685.png](breadboard/servo-PCA9685.png)<br>

Fritzing diagram: [docs/breadboard/servo-PCA9685.fzz](breadboard/servo-PCA9685.fzz)

&nbsp;




Run with:
```bash
node eg/servo-PCA9685.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  console.log("Connected");

  // Initialize the servo instance
  var a = new five.Servo({
    address: 0x40,
    controller: "PCA9685",
    pin: 0,
  });

  var b = new five.Servo({
    address: 0x40,
    controller: "PCA9685",
    range: [0, 180],
    pin: 1,
  });

  var degrees = 0;

  a.to(degrees);
  b.to(degrees);
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
