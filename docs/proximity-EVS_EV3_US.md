<!--remove-start-->

# Proximity - EVShield EV3 (Ultrasonic)

<!--remove-end-->








Run with:
```bash
node eg/proximity-EVS_EV3_US.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "EVS_EV3_US",
    pin: "BBS1"
  });

  proximity.on("change", function() {
    console.log("The obstruction has moved.");
    console.log(this.cm + "cm", this.in + "in");
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
