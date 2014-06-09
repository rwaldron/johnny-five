# Tinkerkit Continuous Servo

Run with:
```bash
node eg/tinkerkit-continuous-servo.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  var servo = new five.Servo({
    pin: "O0",
    type: "continuous"
  });

  new five.Sensor("I0").scale(0, 1).on("change", function() {
    servo.cw(this.value);
  });
});


```


## Breadboard/Illustration


![docs/breadboard/tinkerkit-continuous-servo.png](breadboard/tinkerkit-continuous-servo.png)

- [TinkerKit Servo](http://www.tinkerkit.com/servo/)
- [TinkerKit Linear Potentiometer](http://www.tinkerkit.com/linear-pot/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)



## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
