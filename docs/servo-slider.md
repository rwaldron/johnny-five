<!--remove-start-->
# Servo - Slider

Run with:
```bash
node eg/servo-slider.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo(10);
  var slider = new five.Sensor("A0");

  // Scale the slider's value to fit in the servo's
  // movement range. When the slider position changes
  // update the servo's position
  slider.scale([0, 180]).on("slide", function() {
    servo.to(this.value);
  });
});

```


## Breadboard/Illustration


![docs/breadboard/servo-slider.png](breadboard/servo-slider.png)
[docs/breadboard/servo-slider.fzz](breadboard/servo-slider.fzz)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
