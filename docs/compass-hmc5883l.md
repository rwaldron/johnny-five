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
var five = require("../");
var board = new five.Board();

board.on("ready", function() {

  var compass = new five.Compass({
    controller: "HMC5883L"
  });

  compass.on("change", function() {
    console.log("change");
    console.log("  heading : ", Math.floor(this.heading));
    console.log("  bearing : ", this.bearing.name);
    console.log("--------------------------------------");
  });

  compass.on("data", function() {
    console.log("  heading : ", Math.floor(this.heading));
    console.log("  bearing : ", this.bearing.name);
    console.log("--------------------------------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
