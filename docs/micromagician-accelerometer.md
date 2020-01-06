<!--remove-start-->

# Micro Magician V2 - Accelerometer

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/micromagician-accelerometer.js
```


```javascript
var five = require("johnny-five");

var board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var accelerometer = new five.Accelerometer({
    controller: "MMA7361",
    pins: ["A0", "A1", "A2"],
    autoCalibrate: true
  });

  accelerometer.on("change", function() {
    console.log("accelerometer");
    console.log("  x            : ", this.x);
    console.log("  y            : ", this.y);
    console.log("  z            : ", this.z);
    console.log("  pitch        : ", this.pitch);
    console.log("  roll         : ", this.roll);
    console.log("  acceleration : ", this.acceleration);
    console.log("  inclination  : ", this.inclination);
    console.log("  orientation  : ", this.orientation);
    console.log("--------------------------------------");
  });

});

```









## Learn More

- [Micro Magician V2](http://www.dagurobot.com/goods.php?id=137)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
