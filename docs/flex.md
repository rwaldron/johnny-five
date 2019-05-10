<!--remove-start-->

# Sensor - Flex sensor

<!--remove-end-->






##### Breadboard for "Sensor - Flex sensor"



![docs/breadboard/flex.png](breadboard/flex.png)<br>

Fritzing diagram: [docs/breadboard/flex.fzz](breadboard/flex.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/flex.js
```


```javascript
var five = require("johnny-five"),
  board, flex;

board = new five.Board();

board.on("ready", function() {

  // Create a new `flex sensor` hardware instance.
  flex = new five.Sensor({
    pin: "A2",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: flex
  });

  // "data" get the current reading from the flex sensor
  flex.on("data", function() {
    console.log(this.value);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
