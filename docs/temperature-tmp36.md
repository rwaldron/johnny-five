<!--remove-start-->

# Temperature - TMP36

<!--remove-end-->






##### Breadboard for "Temperature - TMP36"



![docs/breadboard/temperature-tmp36.png](breadboard/temperature-tmp36.png)<br>

Fritzing diagram: [docs/breadboard/temperature-tmp36.fzz](breadboard/temperature-tmp36.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-tmp36.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "TMP36",
    pin: "A0"
  });

  temperature.on("data", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});


```








## Additional Notes
- [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
