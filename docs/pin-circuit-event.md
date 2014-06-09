# Pin Circuit Event

Run with:
```bash
node eg/pin-circuit-event.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  var pin = new five.Pin(5);

  // Event tests
  ["high", "low"].forEach(function(type) {
    pin.on(type, function() {
      console.log("Circuit Event: ", type);
    });
  });
});

```


## Breadboard/Illustration


![docs/breadboard/pin-circuit-event.png](breadboard/pin-circuit-event.png)
[docs/breadboard/pin-circuit-event.fzz](breadboard/pin-circuit-event.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
