# Piezo

Run with:
```bash
node eg/piezo.js
```


```javascript
var five = require("johnny-five"),
  board = new five.Board();

board.on("ready", function() {
  // Creates a piezo object and defines the pin to be used for the signal
  var piezo = new five.Piezo(3);

  // Injects the piezo into the repl
  board.repl.inject({
    piezo: piezo
  });

  // Plays a song
  // The first argument is the notes of the song (space means "no note")
  // The second argument is the length of time (beats) each note (or non-note)
  // should play
  piezo.song("cdfda ag cdfdg gf ", "111111442111111442");
});
```


## Breadboard/Illustration


![docs/breadboard/piezo.png](breadboard/piezo.png)
[docs/breadboard/piezo.fzz](breadboard/piezo.fzz)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
