<!--remove-start-->

# Proximity - SRF10

<!--remove-end-->


Sonar Proximity example with SRF10 sensor.





##### Breadboard for "Proximity - SRF10"



![docs/breadboard/proximity-srf10.png](breadboard/proximity-srf10.png)<br>

Fritzing diagram: [docs/breadboard/proximity-srf10.fzz](breadboard/proximity-srf10.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity-srf10.js
```


```javascript
const { Board, Proximity } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "SRF10"
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
