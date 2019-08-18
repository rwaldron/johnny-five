<!--remove-start-->

# Light - TSL2561

<!--remove-end-->






##### TSL2561



![docs/breadboard/light-ambient-TSL2561.png](breadboard/light-ambient-TSL2561.png)<br>

Fritzing diagram: [docs/breadboard/light-ambient-TSL2561.fzz](breadboard/light-ambient-TSL2561.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/light-ambient-TSL2561.js
```


```javascript
const { Board, Light } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const light = new Light({
    controller: "TSL2561",
  });

  light.on("data", (data) => {
    console.log("Lux: ", data.lux);
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
