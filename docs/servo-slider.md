<!--remove-start-->

# Servo - Slider



Run with:
```bash
node eg/servo-slider.js
```

<!--remove-end-->

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
    pin: 10,
    range: scalingRange
  });


  // The slider's value will be scaled to match the servo's movement range

  slider.scale(scalingRange).on("slide", function(err, value) {

    servo.to(Math.floor(this.value));

  });
});

```


## Illustrations / Photos


### Breadboard for "Servo - Slider"



![docs/breadboard/servo-slider.png](breadboard/servo-slider.png)<br>
Fritzing diagram: [docs/breadboard/servo-slider.fzz](breadboard/servo-slider.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
