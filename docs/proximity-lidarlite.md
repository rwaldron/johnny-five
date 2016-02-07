<!--remove-start-->

# Proximity - LIDAR-Lite

<!--remove-end-->


Basic LIDAR-Lite example.





##### Breadboard for "Proximity - LIDAR-Lite"



![docs/breadboard/proximity-lidarlite.png](breadboard/proximity-lidarlite.png)<br>

Fritzing diagram: [docs/breadboard/proximity-lidarlite.fzz](breadboard/proximity-lidarlite.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity-lidarlite.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "LIDARLITE"
  });

  proximity.on("data", function() {
    console.log("Proximity: ");
    console.log("  cm  : ", this.cm);
    console.log("  in  : ", this.in);
    console.log("-----------------");
  });

  proximity.on("change", function() {
    console.log(this.cm + "cm");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
