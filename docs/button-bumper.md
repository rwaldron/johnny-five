<!--remove-start-->

# Button - Bumper




### Breadboard for "Button - Bumper"



![docs/breadboard/button-bumper.png](breadboard/button-bumper.png)<br>

Fritzing diagram: [docs/breadboard/button-bumper.fzz](breadboard/button-bumper.fzz)

&nbsp;



Run with:
```bash
node eg/button-bumper.js
```

<!--remove-end-->

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








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
