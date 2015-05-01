<!--remove-start-->

# Proximity - LIDAR-Lite


Basic LIDAR-Lite example.


Run with:
```bash
node eg/proximity-lidarlite.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "LIDARLITE"
  });

  // proximity.on("data", function(data) {
    // console.log(data.cm + "cm", data.in + "in");
  // });

  proximity.on("change", function() {
    console.log(this.cm + "cm");
  });

});

```


## Illustrations / Photos


### Breadboard for "Proximity - LIDAR-Lite"



![docs/breadboard/proximity-lidarlite.png](breadboard/proximity-lidarlite.png)<br>

Fritzing diagram: [docs/breadboard/proximity-lidarlite.fzz](breadboard/proximity-lidarlite.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
