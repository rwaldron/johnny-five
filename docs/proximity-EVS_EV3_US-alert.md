<!--remove-start-->

# Proximity - EVShield EV3 (Ultrasonic)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/proximity-EVS_EV3_US-alert.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var red = new five.Led(10);
  var green = new five.Led(11);
  var leds = new five.Leds([red, green]);
  var proximity = new five.Proximity({
    controller: "EVS_EV3_US",
    pin: "BAS1"
  });

  green.on();

  proximity.on("change", function() {
    if (this.cm < 25) {
      if (!red.isOn) {
        leds.toggle();
      }
    } else if (!green.isOn) {
      leds.toggle();
    }
  });
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/6-tM7L28Gcg" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
