<!--remove-start-->

# Thermometer - SI7021

<!--remove-end-->






##### Tessel with SI7021



![docs/breadboard/multi-SI7021.png](breadboard/multi-SI7021.png)<br>

Fritzing diagram: [docs/breadboard/multi-SI7021.fzz](breadboard/multi-SI7021.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-SI7021.js
```


```javascript
var five = require("../");
var Tessel = require("tessel-io");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {
  var temp = new five.Thermometer({
    controller: "SI7021",
    port: "A"
  });

  temp.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

```


## Illustrations / Photos


##### Arduino with SI7021



![docs/breadboard/multi-SI7021-uno.png](breadboard/multi-SI7021-uno.png)<br>

Fritzing diagram: [docs/breadboard/multi-SI7021-uno.fzz](breadboard/multi-SI7021-uno.fzz)

&nbsp;






## Learn More

- [Si7021 Humidity and Temperature Sensor Hookup Guide](https://learn.sparkfun.com/tutorials/si7021-humidity-and-temperature-sensor-hookup-guide)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
