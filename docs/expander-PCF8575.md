<!--remove-start-->

# Expander - PCF8575

<!--remove-end-->


Using an PCF8575 Expander as a Virtual Board (SparkFun I2C Expander Breakout - PCF8575)





##### Breadboard for "Expander - PCF8575"



![docs/breadboard/expander-PCF8575.png](breadboard/expander-PCF8575.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCF8575.fzz](breadboard/expander-PCF8575.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-PCF8575.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("PCF8575")
  );

  var leds = new five.Leds(
    Array.from({
      length: 8
    }, function(_, i) {
      return new five.Led({
        pin: i * 2,
        board: virtual
      });
    })
  );

  leds.on();

  this.repl.inject({
    leds: leds
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
