<!--remove-start-->

# Proximity - EVShield EV3 (Ultrasonic)

<!--remove-end-->








Run with:
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








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
