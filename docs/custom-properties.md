<!--remove-start-->

# Custom Data Properties

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/custom-properties.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  // The "custom" property is available
  // to all component class constructors
  var sensor = new five.Sensor({
    pin: "A0",
    custom: {
      a: 1,
      b: 2,
    }
  });

  console.log(sensor.custom.a);
  console.log(sensor.custom.b);
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
