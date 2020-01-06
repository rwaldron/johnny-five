<!--remove-start-->

# Proximity - GP2Y0A710K0F

<!--remove-end-->


Infrared Proximity example with GP2Y0A710K0F sensor.





##### Breadboard for "Proximity - GP2Y0A710K0F"



![docs/breadboard/proximity-GP2Y0A710K0F.png](breadboard/proximity-GP2Y0A710K0F.png)<br>

Fritzing diagram: [docs/breadboard/proximity-GP2Y0A710K0F.fzz](breadboard/proximity-GP2Y0A710K0F.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity-GP2Y0A710K0F.js
```


```javascript
const { Board, Proximity } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "GP2Y0A710K0F",
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
