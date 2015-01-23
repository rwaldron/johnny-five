<!--remove-start-->
# Relay

Run with:
```bash
node eg/relay.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var relay = new five.Relay(10);

  // Control the relay in real time
  // from the REPL by typing commands, eg.
  //
  // relay.on();
  //
  // relay.off();
  //
  this.repl.inject({
    relay: relay
  });
});





```


## Breadboard/Illustration


![docs/breadboard/relay.png](breadboard/relay.png)
[docs/breadboard/relay.fzz](breadboard/relay.fzz)


![Relay Lamp Controller](http://bocoup.com/img/weblog/relay-breadboard.png)

For this program, you'll need:

[![Relay Component](http://bocoup.com/img/weblog/relay-detail.jpg)](https://www.sparkfun.com/products/11042)



<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
