<!--remove-start-->

# Robotic Claw

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/claw.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var claw = new five.Servo(9);
  var arm = five.Servo(10);
  var degrees = 10;
  var incrementer = 10;
  var last;

  this.loop(25, function() {

    if (degrees >= 180 || degrees === 0) {
      incrementer *= -1;
    }

    degrees += incrementer;

    if (degrees === 180) {
      if (!last || last === 90) {
        last = 180;
      } else {
        last = 90;
      }
      arm.to(last);
    }

    claw.to(degrees);
  });
});



```








## Additional Notes
- [Robotic Claw](https://www.sparkfun.com/products/11524)
- [Robotic Claw Pan/Tilt](https://www.sparkfun.com/products/11674)
- [Robotic Claw Assembly](https://www.sparkfun.com/tutorials/258)
![Robotic Claw](https://cdn.sparkfun.com//assets/parts/7/4/4/4/11524-01a.jpg)
![Robotic Claw Pan/Tilt](https://cdn.sparkfun.com//assets/parts/7/7/6/7/11674-02.jpg)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
