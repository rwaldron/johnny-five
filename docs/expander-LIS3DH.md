<!--remove-start-->

# Expander - LIS3DH

<!--remove-end-->


Using an LIS3DH Expander as a Virtual Board (3 Pin Analog Input: 0.9V-1.8V)





##### Breadboard for "Expander - LIS3DH"



![docs/breadboard/expander-LIS3DH.png](breadboard/expander-LIS3DH.png)<br>

Fritzing diagram: [docs/breadboard/expander-LIS3DH.fzz](breadboard/expander-LIS3DH.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-LIS3DH.js
```


```javascript
const { Board, Expander, Sensor } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("LIS3DH")
  );

  const sensor = new Sensor({
    pin: "A2",
    board: virtual
  });

  sensor.on("change", value => {
    console.log("Sensor: ");
    console.log("  value  : ", sensor.value);
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
