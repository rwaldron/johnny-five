<!--remove-start-->

# Multi - SI7020

<!--remove-end-->






##### Tessel with SI7020



![docs/breadboard/temperature-SI7020.png](breadboard/temperature-SI7020.png)<br>

Fritzing diagram: [docs/breadboard/temperature-SI7020.fzz](breadboard/temperature-SI7020.fzz)

&nbsp;




Run with:
```bash
node eg/multi-SI7020.js
```


```javascript
var five = require("../");
var board = new five.Board({
  port: "/dev/cu.usbmodem1421"
});

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "SI7020" // HTU21D
  });

  multi.on("change", function() {
    console.log("temperature");
    console.log("  celsius           : ", this.temperature.celsius);
    console.log("  fahrenheit        : ", this.temperature.fahrenheit);
    console.log("  kelvin            : ", this.temperature.kelvin);
    console.log("--------------------------------------");

    console.log("Hygrometer");
    console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
    console.log("--------------------------------------");
  });
});


```


## Illustrations / Photos


##### Arduino with SI7020



![docs/breadboard/temperature-SI7020-uno.png](breadboard/temperature-SI7020-uno.png)<br>

Fritzing diagram: [docs/breadboard/temperature-SI7020-uno.fzz](breadboard/temperature-SI7020-uno.fzz)

&nbsp;





## Additional Notes
- [SI7020 - Climate](http://start.tessel.io/modules/climate)


## Learn More

- [SI7020 - I2C Multi Sensor](https://tessel.io/docs/climate)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
