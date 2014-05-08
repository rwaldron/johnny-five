# Led Rgb Anode

Run with:
```bash
node eg/led-rgb-anode.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var a = new five.Led.RGB({
    pins: {
      red: 3,
      green: 5,
      blue: 6
    },
    isAnode: true
  });

  this.repl.inject({
    a: a,
  });

  a.pulse();
});

```


## Breadboard/Illustration


![docs/breadboard/led-rgb-anode.png](breadboard/led-rgb-anode.png)
[docs/breadboard/led-rgb-anode.fzz](breadboard/led-rgb-anode.fzz)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
