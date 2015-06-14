<!--remove-start-->

# TinkerKit - Rotary potentiometer

<!--remove-end-->








Run with:
```bash
node eg/tinkerkit-rotary.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  var servo = new five.Servo("O0");

  new five.Sensor("I1").scale(0, 180).on("change", function() {
    servo.to(this.value);
  });
});


```


## Illustrations / Photos


### TinkerKit Rotary Potentiometer



![docs/images/tinkerkit-rotary.png](images/tinkerkit-rotary.png)  






## Additional Notes
- [TinkerKit Servo](http://tinkerkit.tihhs.nl/servo/)
- [TinkerKit Linear Potentiometer](http://tinkerkit.tihhs.nl/linear-pot/)
- [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
