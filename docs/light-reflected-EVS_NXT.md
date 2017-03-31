<!--remove-start-->

# Light - EVShield NXT (Reflected)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/light-reflected-EVS_NXT.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var reflect = new five.Light({
    controller: "EVS_NXT",
    pin: "BBS1",
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
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
