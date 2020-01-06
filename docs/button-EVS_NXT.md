<!--remove-start-->

# Button - EVShield NXT

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/button-EVS_NXT.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var leda = new five.Led(10);
  var ledb = new five.Led(11);

  var BAS1 = new five.Button({
    controller: "EVS_NXT",
    pin: "BAS1"
  });

  var BBS1 = new five.Button({
    controller: "EVS_NXT",
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





<iframe width="560" height="315" src="https://www.youtube.com/embed/ZwpqyrXFjnc" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
