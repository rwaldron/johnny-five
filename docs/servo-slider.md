<!--remove-start-->

# Servo - Slider control

<!--remove-end-->






##### Breadboard for "Servo - Slider control"



![docs/breadboard/servo-slider.png](breadboard/servo-slider.png)<br>

Fritzing diagram: [docs/breadboard/servo-slider.fzz](breadboard/servo-slider.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/servo-slider.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var slider = new five.Sensor("A0");
  var tilt = new five.Servo(9);

  slider.scale([0, 180]).on("slide", function() {

    // The slider's value will be scaled to match the tilt servo range
    tilt.to(this.value);
  });
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
