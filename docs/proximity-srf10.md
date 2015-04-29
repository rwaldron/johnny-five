<!--remove-start-->

# Proximity - SRF10


Basic sonar Proximity example with SRF10 sensor.


Run with:
```bash
node eg/proximity-srf10.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
  prox, led;

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "SRF10"
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


### Breadboard for "Proximity - SRF10"



![docs/breadboard/proximity-srf10.png](breadboard/proximity-srf10.png)<br>

Fritzing diagram: [docs/breadboard/proximity-srf10.fzz](breadboard/proximity-srf10.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
