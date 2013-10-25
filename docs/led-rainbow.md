# Led Rainbow

Run with:
```bash
node eg/led-rainbow.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var rgb, rainbow, index;

  rgb = new five.Led.RGB([ 3, 5, 6 ]);
  rainbow = [ "FF000", "FF7F00", "00FF00", "FFFF00", "0000FF", "4B0082", "8F00FF" ];
  index = 0;

  setInterval(function() {
    if ( index + 1 === rainbow.length ) {
      index = 0;
    }
    rgb.color( rainbow[ index++ ] );
  }, 500);
});

```


## Breadboard/Illustration


![docs/breadboard/led-rainbow.png](breadboard/led-rainbow.png)
[docs/breadboard/led-rainbow.fzz](breadboard/led-rainbow.fzz)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
