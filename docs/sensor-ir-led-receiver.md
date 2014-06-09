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

  ir.receive.scale([0, 100]).on("data", function() {

    // console.log( this.value );

  });

  ir.reference.on();

  ir.transmit.strobe(1);


  this.repl.inject({
    t: ir.transmit
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
