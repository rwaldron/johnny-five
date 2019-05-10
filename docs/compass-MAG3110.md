<!--remove-start-->

# Compass - MAG3110

<!--remove-end-->






##### Breadboard for "Compass - MAG3110"



![docs/breadboard/compass-MAG3110.png](breadboard/compass-MAG3110.png)<br>

Fritzing diagram: [docs/breadboard/compass-MAG3110.fzz](breadboard/compass-MAG3110.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/compass-MAG3110.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {

  var compass = new five.Compass({
    controller: "MAG3110",
    // Optionally pre-load the offsets
    offsets: {
      x: [-819, -335],
      y: [702, 1182],
      z: [-293, -13],
    },
  });

  compass.on("calibrated", function(offsets) {
    // Use this data with the optional "offsets" property above
    console.log("calibrated:", offsets);
  });

  compass.on("change", function() {
    console.log("change");
    console.log("  heading : ", Math.floor(this.heading));
    console.log("  bearing : ", this.bearing.name);
    console.log("--------------------------------------");
  });
});


```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
