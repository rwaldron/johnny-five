# Button Bumper

Run with:
```bash
node eg/button-bumper.js
```


```javascript
var five = require("johnny-five"),
  bumper, led;

five.Board().on("ready", function() {

  bumper = new five.Button(7);
  led = new five.Led(13);

  bumper.on("hit", function() {

    led.on();

  }).on("release", function() {

    led.off();

  });
});

```


## Breadboard/Illustration


![docs/breadboard/button-bumper.png](breadboard/button-bumper.png)
[docs/breadboard/button-bumper.fzz](breadboard/button-bumper.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
