<!--remove-start-->

# Intel Edison + Grove - Relay

<!--remove-end-->


Using Johnny-Five with Grove's Relay component on the Intel Edison Arduino Breakout. This shield and component will work with any Arduino pin-out compatible hardware platform.







Run this example from the command line with:
```bash
node eg/grove-relay-edison.js
```


```javascript
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Relay module into the
  // Grove Shield's D6 jack.
  var relay = new five.Relay(6);

  // Manually control the relay
  // from your terminal!
  this.repl.inject({
    replay: relay
  });
});


```








## Additional Notes
For this program, you'll need:
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
![Grove - Relay Module](http://www.seeedstudio.com/depot/images/1030200051.jpg)
Learn More At:
- [JavaScript: Relay Control with Johnny-Five on Node](http://bocoup.com/weblog/javascript-relay-with-johnny-five/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
