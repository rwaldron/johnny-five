# Tinkerkit Blink

Run with:
```bash
node eg/tinkerkit-blink.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  new five.Led("O0").strobe(250);
});


```


## Breadboard/Illustration


![docs/breadboard/tinkerkit-blink.png](breadboard/tinkerkit-blink.png)

- [TinkerKit Led](http://www.tinkerkit.com/led-red-10mm/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)



## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
