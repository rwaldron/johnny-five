<!--remove-start-->

# Toggle Switch

<!--remove-end-->






##### Breadboard for "Toggle Switch"



![docs/breadboard/toggle-switch.png](breadboard/toggle-switch.png)<br>

Fritzing diagram: [docs/breadboard/toggle-switch.fzz](breadboard/toggle-switch.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/toggle-switch.js
```


```javascript
var five = require("johnny-five"),
  board, toggleSwitch;

board = new five.Board();

board.on("ready", function() {

  // Create a new `switch` hardware instance.
  // This example allows the switch module to
  // create a completely default instance
  toggleSwitch = new five.Switch(8);

  // Inject the `switch` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    toggleSwitch: toggleSwitch
  });

  // Switch Event API

  // "closed" the switch is closed
  toggleSwitch.on("close", function() {
    console.log("closed");
  });

  // "open" the switch is opened
  toggleSwitch.on("open", function() {
    console.log("open");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
