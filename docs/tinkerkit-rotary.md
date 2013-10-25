# Tinkerkit Rotary

Run with:
```bash
node eg/tinkerkit-rotary.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  var servo = new five.Servo("O0");

  new five.Sensor("I1").scale(0, 180).on("change", function() {
    servo.to( this.value );
  });
});


```


## Breadboard/Illustration


![docs/breadboard/tinkerkit-rotary.png](breadboard/tinkerkit-rotary.png)



- [TinkerKit Servo](http://www.tinkerkit.com/servo/)
- [TinkerKit Linear Potentiometer](http://www.tinkerkit.com/linear-pot/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)





## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
