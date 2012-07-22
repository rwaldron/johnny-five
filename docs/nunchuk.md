# Nunchuk

Run with:
```bash
node eg/nunchuk.js
```


```javascript
var five = require("../lib/johnny-five.js"),
    board, nunchuk;

board = new five.Board();

board.on("ready", function() {

  // Create a new `nunchuk` hardware instance.
  nunchuk = new five.Nunchuk({
    // 0x52 == A4
    // See set up below to wire
    // your chuk properly
    pin: 0x52, 
    freq: 100
  });

  // Nunchuk Event API
  nunchuk.on("chuk", function( err, timestamp ) {
    console.log(this.joystick);
    console.log(this.accelerometer);
  })
});


// Further reading
// http://media.pragprog.com/titles/msard/tinker.pdf
// http://lizarum.com/assignments/physical_computing/2008/wii_nunchuck.html

```

## Documentation


Read the [this pdf](http://media.pragprog.com/titles/msard/tinker.pdf) and set up your chuck exactly as they do in order to get it running with johnny-five. Once you have everything wired up then you can run the example above and start to get the raw data out of the nunchuk


## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com> and Cole Gillespie <mcg42387@gmail.com> Licensed under the MIT license.