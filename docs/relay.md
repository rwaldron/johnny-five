# Relay

Run with:
```bash
node eg/relay.js
```


```javascript
var five = require("johnny-five"),
  board = new five.Board();

board.on("ready", function() {
  var relay = new five.Relay(process.argv[2] || 10);

  this.repl.inject({
    relay: relay
  });
});

```


## Breadboard/Illustration


![docs/breadboard/relay.png](breadboard/relay.png)
[docs/breadboard/relay.fzz](breadboard/relay.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
