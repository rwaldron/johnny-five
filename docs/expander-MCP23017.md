<!--remove-start-->

# Expander - MCP23017

<!--remove-end-->


Using an MCP23017 Expander as a Virtual Board (16 Pin Digital IO)





##### Breadboard for "Expander - MCP23017"



![docs/breadboard/expander-MCP23017.png](breadboard/expander-MCP23017.png)<br>

Fritzing diagram: [docs/breadboard/expander-MCP23017.fzz](breadboard/expander-MCP23017.fzz)

&nbsp;

**Note:** MCP23017 has three pins (15-17) to set the I2C hardware address. By default, these 
pins must be connected to ground for the default address 0x20. If you have another 
I2C device connected with that address or you're planning to use multiple MCP23017s 
see page eight of the
[data sheet](http://ww1.microchip.com/downloads/en/DeviceDoc/21952b.pdf).


Run with:
```bash
node eg/expander-MCP23017.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("MCP23017")
  );

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i * 2, board: virtual });
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
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
