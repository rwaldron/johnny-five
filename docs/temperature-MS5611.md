<!--remove-start-->

# Temperature - MS5611

<!--remove-end-->






##### Temperature - MS5611



![docs/breadboard/multi-MS5611.png](breadboard/multi-MS5611.png)<br>

Fritzing diagram: [docs/breadboard/multi-MS5611.fzz](breadboard/multi-MS5611.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-MS5611.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var temp = new five.Thermometer({
    controller: "MS5611"
  });

  temp.on("change", function() {
    console.log("temperature");
    console.log("  celsius      : ", this.celsius);
    console.log("  fahrenheit   : ", this.fahrenheit);
    console.log("  kelvin       : ", this.kelvin);
    console.log("--------------------------------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
