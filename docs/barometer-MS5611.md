<!--remove-start-->

# Barometer - MS5611

<!--remove-end-->






##### Barometer - MS5611



![docs/breadboard/multi-MS5611.png](breadboard/multi-MS5611.png)<br>

Fritzing diagram: [docs/breadboard/multi-MS5611.fzz](breadboard/multi-MS5611.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/barometer-MS5611.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var pressure = new five.Barometer({
    controller: "MS5611",
  });

  pressure.on("change", function() {
    console.log("Barometer");
    console.log("  pressure     : ", this.pressure);
    console.log("--------------------------------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
