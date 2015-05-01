<!--remove-start-->

# Proximity - HC-SR04


Basic ping Proximity example with HC-SR04 sensor.


Run with:
```bash
node eg/proximity-hcsr04.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  });

  proximity.on("data", function(data) {
    console.log(data.cm + "cm", data.in + "in");
  });

  proximity.on("change", function(data) {
    console.log("The obstruction has moved.");
  });

});

```


## Illustrations / Photos


### Breadboard for "Proximity - HC-SR04"



![docs/breadboard/proximity-hcsr04.png](breadboard/proximity-hcsr04.png)<br>

Fritzing diagram: [docs/breadboard/proximity-hcsr04.fzz](breadboard/proximity-hcsr04.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
