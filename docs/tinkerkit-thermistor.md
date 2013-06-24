# Tinkerkit Thermistor

Run with:
```bash
node eg/tinkerkit-thermistor.js
```


```javascript
var five = require("johnny-five");

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

  global.Thermistor = {
    c: function( raw ) {
      var rthermistor, tempc;

      rthermistor = rb * (adcres / raw - 1);
      tempc = beta / ( Math.log( rthermistor * ginf ) );

      return tempc - kelvin;
    },
    f: function( raw ) {
      return ( this.c(raw) * 9 ) / 5 + 32;
    }
  };
}());

new five.Board().on("ready", function() {
  new five.Sensor("I0").on("change", function() {
    console.log( "F: ", Thermistor.f(this.value) );
    console.log( "C: ", Thermistor.c(this.value) );
  });
});


```

## Breadboard/Illustration

![docs/breadboard/tinkerkit-thermistor.png](breadboard/tinkerkit-thermistor.png)



## Devices

- http://www.tinkerkit.com/thermistor/
- http://www.tinkerkit.com/shield/


## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
