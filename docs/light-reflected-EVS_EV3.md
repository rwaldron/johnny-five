<!--remove-start-->

# Light - EVShield EV3 (Reflected)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/light-reflected-EVS_EV3.js
```


```javascript
const { Board, Light } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const reflect = new Light({
    controller: "EVS_EV3",
    pin: "BAS1",
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
