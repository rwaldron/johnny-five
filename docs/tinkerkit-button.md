<!--remove-start-->

# TinkerKit - Button

<!--remove-end-->








Run with:
```bash
node eg/tinkerkit-button.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  // Attaching to an O* pin in a deviation from
  // TinkerKit tutorials which instruct to attach
  // the button to an I* pin.
  var button = new five.Button("O5");

  ["down", "up", "hold"].forEach(function(type) {
    button.on(type, function() {
      console.log(type);
    });
  });
});


```


## Illustrations / Photos


### TinkerKit Button



![docs/images/tinkerkit-button.png](images/tinkerkit-button.png)  






## Additional Notes
- [TinkerKit Button](http://tinkerkit.tihhs.nl/button/)
- [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
