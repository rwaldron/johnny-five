<!--remove-start-->

# TinkerKit - Touch

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/tinkerkit-touch.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  // Attaching to an O* pin in a deviation from
  // TinkerKit tutorials which instruct to attach
  // the touch to an I* pin.
  //
  // For the "touch" module, simply use a Button
  // instance, like this:
  var touch = new five.Button("O5");

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
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
