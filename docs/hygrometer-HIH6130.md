<!--remove-start-->

# Hygrometer - HIH6130

<!--remove-end-->






##### HIH6130



![docs/breadboard/multi-HIH6130.png](breadboard/multi-HIH6130.png)<br>

Fritzing diagram: [docs/breadboard/multi-HIH6130.fzz](breadboard/multi-HIH6130.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/hygrometer-HIH6130.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "HIH6130"
  });

  hygrometer.on("change", function() {
    console.log("Hygrometer");
    console.log("  relative humidity : ", this.relativeHumidity);
    console.log("--------------------------------------");
  });
});

```









## Learn More

- [HIH6130 Humidity/Temperature Sensor](https://www.sparkfun.com/products/11295)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
