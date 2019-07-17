var five = require("../lib/johnny-five.js");
var Raspi = require("raspi-io").RaspiIO;
var board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  var led = new five.Led("P1-13");
  led.blink();
});

/* @markdown

In order to use the Raspi-IO library, it is recommended that you use
the Raspbian OS. Others may work, but are untested.

```sh
npm install johnny-five raspi-io
```


@markdown */
