<!--remove-start-->

# Color - EVShield NXT (Code)

<!--remove-end-->








Run this example from the command line with:
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





<iframe width="560" height="315" src="https://www.youtube.com/embed/tL_kKiMhUk4" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
