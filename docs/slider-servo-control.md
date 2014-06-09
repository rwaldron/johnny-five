# Slider Servo Control

Run with:
```bash
node eg/slider-servo-control.js
```


```javascript
var five = require("johnny-five"),
  board, slider, servo, scalingRange;

board = new five.Board();

board.on("ready", function() {

  scalingRange = [0, 170];

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  servo = new five.Servo({
    pin: 9,
    range: scalingRange
  });


  // The slider's value will be scaled to match the servo's movement range

  slider.scale(scalingRange).on("slide", function(err, value) {

    servo.to(Math.floor(this.value));

  });
});

```


## Breadboard/Illustration


![docs/breadboard/slider-servo-control.png](breadboard/slider-servo-control.png)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
