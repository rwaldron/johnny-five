# Sensor Ir Led Receiver

Run with:
```bash
node eg/sensor-ir-led-receiver.js
```


```javascript
var five = require("johnny-five"),
    board, ir;

board = new five.Board();
board.on("ready", function() {

  ir = {
    reference: new five.Led(13),
    transmit: new five.Led(9),
    receive: new five.Sensor({
      pin: 8,
      freq: 10
    })
  };

  ir.receive.scale([ 0, 100 ]).on("data", function() {

    // console.log( this.value );

  });

  ir.reference.on();

  ir.transmit.strobe(1);


  this.repl.inject({
    t: ir.transmit
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
