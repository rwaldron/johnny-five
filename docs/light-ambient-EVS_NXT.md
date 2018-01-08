<!--remove-start-->

# Light - EVShield NXT (Ambient)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/light-ambient-EVS_NXT.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var light = new five.Light({
    controller: "EVS_NXT",
    pin: "BAS2"
  });

  light.on("change", function() {
    console.log("Ambient Light Level: ", this.level);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
