<!--remove-start-->

# Thermometer - TMP102

<!--remove-end-->






##### Breadboard for "Thermometer - TMP102"



![docs/breadboard/temperature-tmp102.png](breadboard/temperature-tmp102.png)<br>

Fritzing diagram: [docs/breadboard/temperature-tmp102.fzz](breadboard/temperature-tmp102.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-tmp102.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "TMP102"
  });

  temperature.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});


```








## Additional Notes
- [TMP102 - Temperature Sensor](https://www.sparkfun.com/products/11931)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
