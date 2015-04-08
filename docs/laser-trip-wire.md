<!--remove-start-->

# Laser Trip Wire



Run with:
```bash
node eg/laser-trip-wire.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var laser = new five.Led(9);
  var detection = new five.Sensor("A0");
  var isSecure = false;

  laser.on();

  detection.scale(0, 1).on("change", function() {
    var reading = !(this.value | 0);

    if (isSecure !== reading) {
      isSecure = reading;

      if (!isSecure) {
        console.log("Intruder");
      }
    }
  });
});

```


## Illustrations / Photos


### Breadboard for "Laser Trip Wire"



![docs/breadboard/laser-trip-wire.png](breadboard/laser-trip-wire.png)<br>
&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
