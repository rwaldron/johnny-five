<!--remove-start-->

# Light - EVShield NXT (Reflected)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/light-reflected-EVS_NXT.js
```


```javascript
const { Board, Light } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const reflected = new Light({
    controller: "EVS_NXT",
    pin: "BBS1",
    mode: "reflected"
  });

  reflected.on("change", () => {
    console.log("Reflected Light Level: ");
    console.log("  level  : ", reflected.level);
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
