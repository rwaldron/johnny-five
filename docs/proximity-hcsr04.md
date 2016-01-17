<!--remove-start-->

# Proximity - HC-SR04

<!--remove-end-->


Basic ping Proximity example for any of the [`PING_PULSE_IN`](http://johnny-five.io/api/proximity/#controller-alias-table) components (eg. `HCSR04` or Parallax's Ultrasonic Ping). [PingFirmata](http://johnny-five.io/api/proximity/#pingfirmata) must be loaded onto Arduino-compatible boards to enable this component.





##### Breadboard for "Proximity - HC-SR04"



![docs/breadboard/proximity-hcsr04.png](breadboard/proximity-hcsr04.png)<br>

Fritzing diagram: [docs/breadboard/proximity-hcsr04.fzz](breadboard/proximity-hcsr04.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity-hcsr04.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  });

  proximity.on("data", function() {
    console.log("Proximity: ");
    console.log("  cm  : ", this.cm);
    console.log("  in  : ", this.in);
    console.log("-----------------");
  });

  proximity.on("change", function() {
    console.log("The obstruction has moved.");
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
