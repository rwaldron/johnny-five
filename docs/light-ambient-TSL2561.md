<!--remove-start-->

# Light - TSL2561

<!--remove-end-->






##### TSL2561



![docs/breadboard/light-ambient-TSL2561.png](breadboard/light-ambient-TSL2561.png)<br>

Fritzing diagram: [docs/breadboard/light-ambient-TSL2561.fzz](breadboard/light-ambient-TSL2561.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/light-ambient-TSL2561.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var light = new five.Light({
    controller: "TSL2561",
  });

  light.on("data", function() {
    console.log("Lux: ", this.lux);
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
