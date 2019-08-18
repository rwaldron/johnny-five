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
  const reflect = new Light({
    controller: "EVS_NXT",
    pin: "BBS1",
    mode: "reflected"
  });

  reflect.on("change", (data) => {
    console.log("Light Reflection Level: ", data.level);
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
