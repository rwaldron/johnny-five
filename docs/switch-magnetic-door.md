<!--remove-start-->

# Switch - Magnetic Door

<!--remove-end-->






##### Breadboard for "Switch - Magnetic Door"



![docs/breadboard/switch-magnetic-door.png](breadboard/switch-magnetic-door.png)<br>

Fritzing diagram: [docs/breadboard/switch-magnetic-door.fzz](breadboard/switch-magnetic-door.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/switch-magnetic-door.js
```


```javascript
const {Board, Switch} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // Contact Mode: Normally Open (default!)
  const sw = new Switch(7);
  sw.on("open", () => console.log("open"));
  sw.on("close", () => console.log("close"));
});

```









## Learn More

- [Magnetic Door Switch](https://www.sparkfun.com/products/13247)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
