<!--remove-start-->

# Switch

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/switch.js
```


```javascript
const {Board, Led, Switch} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const spdt = new Switch(8);
  const led = new Led(13);
  
  spdt.on("open", () => led.off());
  spdt.on("close", () => led.on());
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
