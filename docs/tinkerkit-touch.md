<!--remove-start-->

# TinkerKit - Touch

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/tinkerkit-touch.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var touch = new five.Button({
    controller: "TINKERKIT",
    pin: "I0",
  });

  ["down", "up", "hold"].forEach(function(type) {
    touch.on(type, function() {
      console.log(type);
    });
  });
});

```


## Illustrations / Photos


### TinkerKit Touch



![docs/images/tinkerkit-touch.png](images/tinkerkit-touch.png)  







## Learn More

- [TinkerKit Touch](http://tinkerkit.tihhs.nl/touch/)

- [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
