<!--remove-start-->

# Temperature - DS18B20



Run with:
```bash
node eg/temperature-ds18b20.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  // This requires OneWire support using the ConfigurableFirmata
  var temperature = new five.Temperature({
    controller: "DS18B20",
    pin: 2
  });

  temperature.on("data", function(err, data) {
    console.log(data.celsius + "°C", data.fahrenheit + "°F");
    console.log("0x" + this.address.toString(16));
  });
});


```


## Illustrations / Photos


### Breadboard for "Temperature - DS18B20"



![docs/breadboard/temperature-ds18b20.png](breadboard/temperature-ds18b20.png)<br>
Fritzing diagram: [docs/breadboard/temperature-ds18b20.fzz](breadboard/temperature-ds18b20.fzz)

&nbsp;




## Additional Notes

- [DS18B20 - Temperature Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
