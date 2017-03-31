<!--remove-start-->

# Thermometer - DS18B20

<!--remove-end-->






##### Breadboard for "Thermometer - DS18B20"



![docs/breadboard/temperature-ds18b20.png](breadboard/temperature-ds18b20.png)<br>

Fritzing diagram: [docs/breadboard/temperature-ds18b20.fzz](breadboard/temperature-ds18b20.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-ds18b20.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  // This requires OneWire support using the ConfigurableFirmata
  var temperature = new five.Thermometer({
    controller: "DS18B20",
    pin: 2
  });

  temperature.on("change", function() {
    console.log(this.celsius + "°C");
    // console.log("0x" + this.address.toString(16));
  });
});


```








## Additional Notes
- [DS18B20 - Temperature Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
