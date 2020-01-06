<!--remove-start-->

# Light - EVShield NXT (Ambient)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/light-ambient-EVS_NXT.js
```


```javascript
const { Board, Light } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const ambient = new Light({
    controller: "EVS_NXT",
    pin: "BAS2"
  });

  ambient.on("change", () => {
    console.log("Ambient Light Level: ");
    console.log("  level  : ", ambient.level);
    console.log("-----------------");
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
