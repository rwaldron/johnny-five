<!--remove-start-->

# Color - ISL29125

<!--remove-end-->








Run with:
```bash
node eg/color-ISL29125.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var rgb = new five.Led.RGB([ 9, 10, 11 ]);
  var color = new five.Color({
    controller: "ISL29125"
  });

  color.on("change", function() {
    console.log("Color: ", five.Color.hexCode(this.rgb));
  });
});


// TODO: need Fritzing for this

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
