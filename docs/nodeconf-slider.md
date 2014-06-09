# Nodeconf Slider

Run with:
```bash
node eg/nodeconf-slider.js
```


```javascript
var five = require("johnny-five"),
  board, slider, servo, scalingRange;

board = new five.Board();

board.on("ready", function() {

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  // log out the slider values to the console.
  slider.on("slide", function(err, value) {
    if (err) {
      console.log("error: ", err);
    } else {
      console.log(Math.floor(this.value));
    }
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
