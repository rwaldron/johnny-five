<!--remove-start-->
# TinkerKit thermistor

Run with:
```bash
node eg/tinkerkit-thermistor.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five"),
  Thermistor;

(function() {
  var adcres, beta, kelvin, rb, ginf;

  adcres = 1023;
  // Beta parameter
  beta = 3950;
  // 0°C = 273.15 K
  kelvin = 273.15;
  // 10 kOhm
  rb = 10000;
  // Ginf = 1/Rinf
  ginf = 120.6685;

  Thermistor = {
    c: function(raw) {
      var rthermistor, tempc;

      rthermistor = rb * (adcres / raw - 1);
      tempc = beta / (Math.log(rthermistor * ginf));

      return tempc - kelvin;
    },
    f: function(raw) {
      return (this.c(raw) * 9) / 5 + 32;
    }
  };
}());

new five.Board().on("ready", function() {
  new five.Sensor("I0").on("change", function() {
    console.log("F: ", Thermistor.f(this.value));
    console.log("C: ", Thermistor.c(this.value));
  });
});


```


## Breadboard/Illustration


![docs/breadboard/tinkerkit-thermistor.png](breadboard/tinkerkit-thermistor.png)

- [TinkerKit Thermistor](http://www.tinkerkit.com/thermistor/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)


<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
