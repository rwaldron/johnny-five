<!--remove-start-->

# Compass - HMC5883L`





Run with:
```bash
node eg/compass-hmc5883l.js
```

<!--remove-end-->

```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {

  var compass = new five.Compass({
    controller: "HMC5883L"
  });

  compass.on("headingchange", function() {
    console.log("headingchange");
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


## Illustrations / Photos


### Breadboard for "Compass - HMC5883L`"



![docs/breadboard/compass-hmc5883l.png](breadboard/compass-hmc5883l.png)<br>
Fritzing diagram: [docs/breadboard/compass-hmc5883l.fzz](breadboard/compass-hmc5883l.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
