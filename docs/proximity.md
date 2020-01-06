<!--remove-start-->

# Proximity

<!--remove-end-->


Infrared Proximity example





##### Breadboard for "Proximity"



![docs/breadboard/proximity.png](breadboard/proximity.png)<br>

Fritzing diagram: [docs/breadboard/proximity.fzz](breadboard/proximity.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity.js
```


```javascript
const { Board, Proximity } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "GP2Y0A21YK",
    pin: "A0"
  });

  proximity.on("change", () => {
    const {centimeters, inches} = proximity;
    console.log("Proximity: ");
    console.log("  cm  : ", centimeters);
    console.log("  in  : ", inches);
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
