<!--remove-start-->

# Color - EVShield EV3 (Raw)

<!--remove-end-->








Run with:
```bash
node eg/color-raw-EVS_EV3.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var color = new five.Color({
    controller: "EVS_EV3",
    mode: "RAW",
    pin: "BAS1"
  });

  color.on("change", function() {
    console.log("Color: ", this.rgb);
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
