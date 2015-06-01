<!--remove-start-->

# Expander - PCA9685


Using an PCA9685 Expander as a Virtual Board (Adafruit 16 Channel PWM Shield)


Run with:
```bash
node eg/expander-PCA9685.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var expander = new five.Expander({
    controller: "PCA9685"
  });

  var virtual = new five.Board.Virtual({
    io: expander
  });

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i * 2, board: virtual });
    })
  );

  leds.pulse();

  this.repl.inject({
    expander: expander,
    leds: leds
  });
});


```


## Illustrations / Photos


### Breadboard for "Expander - PCA9685"



![docs/breadboard/expander-PCA9685.png](breadboard/expander-PCA9685.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCA9685.fzz](breadboard/expander-PCA9685.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
