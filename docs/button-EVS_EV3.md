<!--remove-start-->

# Button - EVShield EV3

<!--remove-end-->








Run with:
```bash
node eg/button-EVS_EV3.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var leda = new five.Led(10);
  var ledb = new five.Led(11);

  var BAS1 = new five.Button({
    controller: "EVS_EV3",
    pin: "BAS1"
  });

  var BBS1 = new five.Button({
    controller: "EVS_EV3",
    pin: "BBS1"
  });

  BAS1.on("down", function(value) {
    leda.on();
  });

  BAS1.on("hold", function() {
    leda.blink(500);
  });

  BAS1.on("up", function() {
    leda.stop().off();
  });

  BBS1.on("down", function(value) {
    ledb.on();
  });

  BBS1.on("hold", function() {
    ledb.blink(500);
  });

  BBS1.on("up", function() {
    ledb.stop().off();
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
