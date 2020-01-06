<!--remove-start-->

# Proximity - MB1230

<!--remove-end-->






##### Proximity - MB1230


Sonar Proximity example with MB1230 sensor.


![docs/breadboard/proximity-mb1003.png](breadboard/proximity-mb1003.png)<br>

Fritzing diagram: [docs/breadboard/proximity-mb1003.fzz](breadboard/proximity-mb1003.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity-mb1230.js
```


```javascript
const { Board, Proximity } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "MB1230",
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
