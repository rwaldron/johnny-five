<!--remove-start-->

# Altimeter - BMP085

<!--remove-end-->






##### BMP085



![docs/breadboard/multi-bmp085-sfe.png](breadboard/multi-bmp085-sfe.png)<br>

Fritzing diagram: [docs/breadboard/multi-bmp085-sfe.fzz](breadboard/multi-bmp085-sfe.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/altimeter-BMP085.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  // By including a base `elevation` property, the values
  // received will be absolute elevation (from sealevel)
  var altimeter = new five.Altimeter({
    controller: "BMP085",
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


### BMP085 - Relative Elevation



```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // By omitting the base `elevation` property, the values
  // received will be relative to your present elevation
  var altimeter = new five.Altimeter({
    controller: "BMP085",
  });

  altimeter.on("change", function() {
    console.log("Altimeter");
    console.log("  feet         : ", this.feet);
    console.log("  meters       : ", this.meters);
    console.log("--------------------------------------");
  });
});

```



## Illustrations / Photos


##### BMP085 (Adafruit)



![docs/breadboard/multi-bmp085.png](breadboard/multi-bmp085.png)<br>

Fritzing diagram: [docs/breadboard/multi-bmp085.fzz](breadboard/multi-bmp085.fzz)

&nbsp;






## Learn More

- [BMP085 Barometric Pressure/Temperature/Altitude Sensor](https://www.adafruit.com/products/391)

- [Grove - Barometer Sensor（BMP085)](http://www.seeedstudio.com/depot/grove-barometer-sensor-p-1199.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
