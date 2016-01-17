<!--remove-start-->

# Color - EVShield EV3 (Code)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/color-EVS_EV3.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var color = new five.Color({
    controller: "EVS_EV3",
    pin: "BAS1"
  });

  color.on("change", function() {
    console.log("Color: ", this.rgb);
  });
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/E2SD6MGpMUI" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
