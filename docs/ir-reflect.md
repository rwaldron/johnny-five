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
  ir.on("data", function( err, timestamp ) {
    console.log( "data" );
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
