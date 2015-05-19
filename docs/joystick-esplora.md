<!--remove-start-->

# Joystick - Esplora



Run with:
```bash
node eg/joystick-esplora.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  /*
    Be sure to reflash your Esplora with StandardFirmata!

    In the Arduino IDE:

    Tools > Boards > Arduino Leonard or Arduino Esplora
   */
  var joystick = new five.Joystick({
    controller: "ESPLORA"
  });

  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
    console.log("--------------------------------------");
  });
});

```


## Illustrations / Photos


### Joystick - Esplora


Esplora joystick example.


![docs/breadboard/esplora.png](breadboard/esplora.png)<br>

Fritzing diagram: [docs/breadboard/esplora.fzz](breadboard/esplora.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
