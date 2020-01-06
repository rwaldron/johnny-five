<!--remove-start-->

# Compass - HMC5883L

<!--remove-end-->






##### Breadboard for "Compass - HMC5883L"



![docs/breadboard/compass-hmc5883l.png](breadboard/compass-hmc5883l.png)<br>

Fritzing diagram: [docs/breadboard/compass-hmc5883l.fzz](breadboard/compass-hmc5883l.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/compass-hmc5883l.js
```


```javascript
const { Board, Compass } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const compass = new Compass({
    controller: "HMC5883L"
  });

  compass.on("change", () => {
    const {bearing, heading} = compass;
    console.log("Compass:");
    console.log("  bearing     : ", bearing);
    console.log("  heading     : ", heading);
    console.log("--------------------------------------");
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
