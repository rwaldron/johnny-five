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
const { Altimeter, Board } = require("../");
const board = new Board();

board.on("ready", () => {
  // By including a base `elevation` property, the values
  // received will be absolute elevation (from sealevel)
  const altimeter = new Altimeter({
    controller: "MS5611",
    // Change `elevation` with whatever is reported
    // on http://www.whatismyelevation.com/.
    // `12` is the elevation (meters) for where I live in Brooklyn
    elevation: 12
  });

  altimeter.on("change", () => {
    const {feet, meters} = altimeter;
    console.log("Altimeter:");
    console.log("  feet         : ", feet);
    console.log("  meters       : ", meters);
    console.log("--------------------------------------");
  });
});


```

## Alternates


### MS5611 - Relative Elevation



```javascript
const { Altimeter, Board } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // By omitting the base `elevation` property, the values
  // received will be relative to your present elevation
  const altimeter = new Altimeter({
    controller: "MS5611"
  });

  altimeter.on("change", () => {
    const {feet, meters} = altimeter;
    console.log("Altimeter:");
    console.log("  feet         : ", feet);
    console.log("  meters       : ", meters);
    console.log("--------------------------------------");
  });
});


```









&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
