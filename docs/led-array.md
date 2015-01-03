# Led Array

Run with:
```bash
node eg/led-array.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var array = new five.Led.Array([3, 5, 6]);

  this.repl.inject({
    array: array
  });

  array.pulse();
});


```


## Breadboard/Illustration


![docs/breadboard/led-array.png](breadboard/led-array.png)


Control multiple LEDs at once by creating an Led.Array.
All must be on PWM pins if you want to use methods such
as pulse() or fade()




## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
