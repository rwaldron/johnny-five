<!--remove-start-->

# Light - EVShield EV3 (Reflected)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/light-reflected-EVS_EV3.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var reflect = new five.Light({
    controller: "EVS_EV3",
    pin: "BAS1",
    mode: "reflected"
  });

  reflect.on("change", function() {
    console.log("Light Reflection Level: ", this.level);
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
