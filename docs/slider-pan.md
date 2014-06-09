# Slider Pan

Run with:
```bash
node eg/slider-pan.js
```


```javascript
var five = require("johnny-five"),
  board, slider, tilt, scalingRange;

board = new five.Board();

board.on("ready", function() {

  scalingRange = [0, 170];

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  tilt = new five.Servo({
    pin: 9,
    range: scalingRange
  });

  slider.scale(scalingRange).on("slide", function(err, value) {

    // The slider's value will be scaled to match the tilt servo range

    tilt.to(Math.floor(this.value));

  });
});

```


## Breadboard/Illustration


![docs/breadboard/slider-pan.png](breadboard/slider-pan.png)
[docs/breadboard/slider-pan.fzz](breadboard/slider-pan.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
