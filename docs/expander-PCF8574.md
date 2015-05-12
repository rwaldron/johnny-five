<!--remove-start-->

# Expander - PCF8574


Using an PCF8574 Expander as a Virtual Board (WaveShare 8 Pin Digital IO)


Run with:
```bash
node eg/expander-PCF8574.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var expander = new five.Expander({
    controller: "PCF8574"
  });

  var virtual = new five.Board.Virtual({
    io: expander
  });

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i, board: virtual });
    })
  );

  leds.on();

  this.repl.inject({
    expander: expander,
    leds: leds
  });
});


```


## Illustrations / Photos


### Breadboard for "Expander - PCF8574"



![docs/breadboard/expander-PCF8574.png](breadboard/expander-PCF8574.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCF8574.fzz](breadboard/expander-PCF8574.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
