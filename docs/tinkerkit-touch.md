<!--remove-start-->

# TinkerKit - Touch



Run with:
```bash
node eg/tinkerkit-touch.js
```

<!--remove-end-->

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






## Additional Notes
- [TinkerKit Touch](http://www.tinkerkit.com/touch/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
