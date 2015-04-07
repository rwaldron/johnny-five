<!--remove-start-->
# Temperature (TMP36)

Run with:
```bash
node eg/temperature-tmp36.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var temperature = new five.Temperature({
    controller: "TMP36",
    pin: "A0"
  });

  temperature.on("data", function(err, data) {
    console.log(data.celsius + "°C", data.fahrenheit + "°F");
  });
});


```


## Breadboard/Illustration


![docs/breadboard/temperature-tmp36.png](breadboard/temperature-tmp36.png)  
[Fritzing diagram: docs/breadboard/temperature-tmp36.fzz](breadboard/temperature-tmp36.fzz)

- [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)


<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
