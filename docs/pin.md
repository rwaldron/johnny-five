<!--remove-start-->

# Pin

<!--remove-end-->






##### Breadboard for "Pin"



![docs/breadboard/pin.png](breadboard/pin.png)<br>

Fritzing diagram: [docs/breadboard/pin.fzz](breadboard/pin.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/pin.js
```


```javascript
var five = require("johnny-five");
var temporal = require("temporal");
var board = new five.Board();

board.on("ready", function() {
  var events = [];
  var strobe = new five.Pin(13);

  temporal.loop(500, function(loop) {
    strobe[loop.called % 2 === 0 ? "high" : "low"]();
  });


  // Pin emits "high" and "low" events, whether it's
  // input or output.
  ["high", "low"].forEach(function(state) {
    strobe.on(state, function() {
      if (events.indexOf(state) === -1) {
        console.log("Event emitted for:", state, "on", this.addr);
        events.push(state);
      }
    });
  });

  var analog = new five.Pin("A0");

  // Query the analog pin for its current state.
  analog.query(function(state) {
    console.log(state);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
