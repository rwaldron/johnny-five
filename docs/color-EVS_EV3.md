<!--remove-start-->

# Color - EVShield EV3 (Code)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/color-EVS_EV3.js
```


```javascript
const {Board, Color} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const color = new Color({
    controller: "EVS_EV3",
    pin: "BAS1"
  });

  color.on("change", () => {
    console.log("Color:");
    console.log("  rgb     : ", color.rgb);
    console.log("--------------------------------------");
  });
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/E2SD6MGpMUI" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
