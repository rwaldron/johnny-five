# Pin

Run with:
```bash
node eg/pin.js
```


```javascript
var five = require("johnny-five"),
  temporal = require("temporal"),
  board = new five.Board();

board.on("ready", function() {
  var events, strobe, analog;

  events = [];
  strobe = new five.Pin({
    addr: 13
  });

  temporal.loop(500, function(loop) {
    strobe[loop.called % 2 === 0 ? "high" : "low"]();
  });


  // Event tests
  ["high", "low"].forEach(function(state) {
    strobe.on(state, function() {
      if (events.indexOf(state) === -1) {
        console.log("Event emitted for:", state, "on", this.addr);
        events.push(state);
      }
    });
  });

  analog = new five.Pin("A0");

  analog.query(function(state) {
    console.log(state);
  });
});

```


## Breadboard/Illustration


![docs/breadboard/pin.png](breadboard/pin.png)
[docs/breadboard/pin.fzz](breadboard/pin.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
