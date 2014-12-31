# Temperature Tmp36

Run with:
```bash
node eg/temperature-tmp36.js
```


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





- [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)



## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
