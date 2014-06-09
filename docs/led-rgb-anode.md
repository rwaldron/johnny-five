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





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
