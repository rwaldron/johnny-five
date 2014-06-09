# Tinkerkit Tilt

Run with:
```bash
node eg/tinkerkit-tilt.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  // var servo = new five.Servo("O0");

  new five.Sensor("I2").on("change", function() {
    console.log(this.boolean);
  });
});


```


## Breadboard/Illustration


![docs/breadboard/tinkerkit-tilt.png](breadboard/tinkerkit-tilt.png)

- [TinkerKit Servo](http://www.tinkerkit.com/servo/)
- [TinkerKit Linear Potentiometer](http://www.tinkerkit.com/linear-pot/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)



## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
