<!--remove-start-->

# Sensor - Force sensitive resistor



Run with:
```bash
node eg/sensor-fsr.js
```

<!--remove-end-->

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


## Illustrations / Photos


### Breadboard for "Sensor - Force sensitive resistor"



![docs/breadboard/sensor-fsr.png](breadboard/sensor-fsr.png)<br>

Fritzing diagram: [docs/breadboard/sensor-fsr.fzz](breadboard/sensor-fsr.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
