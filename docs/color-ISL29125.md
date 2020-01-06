<!--remove-start-->

# Color - ISL29125

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/color-ISL29125.js
```


```javascript
const {Board, Color} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const color = new Color({
    controller: "ISL29125",
  });

  color.on("change", () => {
    console.log("Color:");
    console.log("  rgb     : ", color.rgb);
    console.log("--------------------------------------");
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
