<!--remove-start-->

# Proximity - HC-SR04


Basic ping Proximity example with HC-SR04 sensor.



### Breadboard for "Proximity - HC-SR04"



![docs/breadboard/proximity-hcsr04.png](breadboard/proximity-hcsr04.png)<br>

Fritzing diagram: [docs/breadboard/proximity-hcsr04.fzz](breadboard/proximity-hcsr04.fzz)

&nbsp;



Run with:
```bash
node eg/proximity-hcsr04.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  });

  proximity.on("data", function() {
    console.log(this.cm + "cm", this.in + "in");
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
