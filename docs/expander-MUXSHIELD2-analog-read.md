<!--remove-start-->

# Expander - MUXSHIELD2, Analog Sensors

<!--remove-end-->


Using a MUXSHIELD2 Expander as a Virtual Board. Displays value of potentiometers in console graph. (`npm install barcli`)





##### Breadboard for "Expander - MUXSHIELD2, Analog Sensors"



![docs/breadboard/expander-MUXSHIELD2-analog-read.png](breadboard/expander-MUXSHIELD2-analog-read.png)<br>

Fritzing diagram: [docs/breadboard/expander-MUXSHIELD2-analog-read.fzz](breadboard/expander-MUXSHIELD2-analog-read.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-MUXSHIELD2-analog-read.js
```


```javascript
var Barcli = require("barcli");
var five = require("johnny-five");
var board = new five.Board({
  repl: false,
  debug: false
});

board.on("ready", function() {
  var bars = {
    a: new Barcli({ label: "IO1-15", range: [0, 1023] }),
    b: new Barcli({ label: "IO2-15", range: [0, 1023] }),
  };

  var virtual = new five.Board.Virtual(
    new five.Expander("MUXSHIELD2")
  );

  var a = new five.Sensor({
    pin: "IO1-15",
    board: virtual
  });

  a.on("change", function() {
    bars.a.update(this.value);
  });

  var b = new five.Sensor({
    pin: "IO2-15",
    board: virtual
  });

  b.on("change", function() {
    bars.b.update(this.value);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
