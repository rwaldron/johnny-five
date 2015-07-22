<!--remove-start-->

# Color - EVShield NXT (Code)

<!--remove-end-->








Run with:
```bash
node eg/color-EVS_NXT.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var color = new five.Color({
    controller: "EVS_NXT",
    pin: "BBS2"
  });

  color.on("change", function() {
    console.log("Color: ", five.Color.hexCode(this.rgb));
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
