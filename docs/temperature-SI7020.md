<!--remove-start-->

# Thermometer - SI7020

<!--remove-end-->






##### Tessel with SI7020



![docs/breadboard/temperature-SI7020.png](breadboard/temperature-SI7020.png)<br>

Fritzing diagram: [docs/breadboard/temperature-SI7020.fzz](breadboard/temperature-SI7020.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-SI7020.js
```


```javascript
var five = require("../");
var Tessel = require("tessel-io");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {
  var temp = new five.Thermometer({
    controller: "SI7020",
    port: "A"
  });

  temp.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

```


## Illustrations / Photos


##### Arduino with SI7020



![docs/breadboard/temperature-SI7020-uno.png](breadboard/temperature-SI7020-uno.png)<br>

Fritzing diagram: [docs/breadboard/temperature-SI7020-uno.fzz](breadboard/temperature-SI7020-uno.fzz)

&nbsp;






## Learn More

- [SI7020 - I2C Temperature Sensor](https://tessel.io/docs/climate)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
