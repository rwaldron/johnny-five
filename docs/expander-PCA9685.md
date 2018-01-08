<!--remove-start-->

# Expander - PCA9685

<!--remove-end-->


Using an PCA9685 Expander as a Virtual Board (Adafruit 16 Channel PWM Shield)





##### Breadboard for "Expander - PCA9685"



![docs/breadboard/expander-PCA9685.png](breadboard/expander-PCA9685.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCA9685.fzz](breadboard/expander-PCA9685.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-PCA9685.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("PCA9685")
  );

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i * 2, board: virtual });
    })
  );

  leds.pulse();

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
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
