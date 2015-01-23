<!--remove-start-->
# Relay Lamp Controller

Run with:
```bash
node eg/relay-lamp-controller.js
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






![Relay Lamp Controller](http://bocoup.com/img/weblog/relay-breadboard.png)

The breadboard diagram shows a Keyes Relay, however any Relay component will work.

Learn More:

- [JavaScript: Relay Control with Johnny-Five on Node](http://bocoup.com/weblog/javascript-relay-with-johnny-five/)



<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
