# Sensor Fsr

Run with:
```bash
node eg/sensor-fsr.js
```


```javascript
var five = require("johnny-five"),
  fsr, led;

(new five.Board()).on("ready", function() {

    // Create a new `fsr` hardware instance.
    fsr = new five.Sensor({
      pin: "A0",
      freq: 25
    });

    led = new five.Led(9);

    // Scale the sensor's value to the LED's brightness range
    fsr.scale([0, 255]).on("data", function() {

      // set the led's brightness based on force
      // applied to force sensitive resistor

      led.brightness(this.value);
    });
  });

```


## Breadboard/Illustration


![docs/breadboard/sensor-fsr.png](breadboard/sensor-fsr.png)
[docs/breadboard/sensor-fsr.fzz](breadboard/sensor-fsr.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
