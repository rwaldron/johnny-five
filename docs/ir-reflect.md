# Ir Reflect

Run with:
```bash
node eg/ir-reflect.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  // Create a new `IR.Reflect` hardware instance.
  //
  // five.IR.Reflect();
  //
  // (Alias of:
  //   new five.IR({
  //    device: "QRE1113GR",
  //    freq: 50
  //   });
  // )
  //

  var ir = new five.IR.Reflect();

  // "data"
  //
  // Fires continuously, every 66ms.
  //
  ir.on("data", function(err, timestamp) {
    console.log("data");
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
