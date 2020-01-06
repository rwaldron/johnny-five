<!--remove-start-->

# Color - EVShield NXT (Code)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/color-EVS_NXT.js
```


```javascript
const {Board, Color} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const color = new Color({
    controller: "EVS_NXT",
    pin: "BBS2"
  });

  color.on("change", () => {
    console.log("Color:");
    console.log("  rgb     : ", color.rgb);
    console.log("--------------------------------------");
  });
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/tL_kKiMhUk4" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
