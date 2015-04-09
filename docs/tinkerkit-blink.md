<!--remove-start-->

# TinkerKit - Blink



Run with:
```bash
node eg/tinkerkit-blink.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  new five.Led("O0").strobe(250);
});


```


## Illustrations / Photos


### TinkerKit Blink



![docs/images/tinkerkit-blink.png](images/tinkerkit-blink.png)  






## Additional Notes
- [TinkerKit Led](http://www.tinkerkit.com/led-red-10mm/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
