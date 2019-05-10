<!--remove-start-->

# Altimeter - MS5611

<!--remove-end-->






##### MS5611



![docs/breadboard/multi-MS5611.png](breadboard/multi-MS5611.png)<br>

Fritzing diagram: [docs/breadboard/multi-MS5611.fzz](breadboard/multi-MS5611.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/altimeter-MS5611.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  // By including a base `elevation` property, the values
  // received will be absolute elevation (from sealevel)
  var altimeter = new five.Altimeter({
    controller: "MS5611",
    // Change `elevation` with whatever is reported
    // on http://www.whatismyelevation.com/.
    // `12` is the elevation (meters) for where I live in Brooklyn
    elevation: 12,
  });

  altimeter.on("change", function() {
    console.log("Altimeter");
    console.log("  feet         : ", this.feet);
    console.log("  meters       : ", this.meters);
    console.log("--------------------------------------");
  });
});

```

## Alternates


### MS5611 - Relative Elevation



```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // By omitting the base `elevation` property, the values
  // received will be relative to your present elevation
  var altimeter = new five.Altimeter({
    controller: "MS5611",
  });

  altimeter.on("change", function() {
    console.log("Altimeter");
    console.log("  feet         : ", this.feet);
    console.log("  meters       : ", this.meters);
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
