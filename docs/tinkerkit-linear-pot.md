<!--remove-start-->

# TinkerKit - Linear potentiometer



Run with:
```bash
node eg/tinkerkit-linear-pot.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  new five.Sensor("I0").scale(0, 255).on("data", function() {
    console.log(Math.round(this.value));
  });
});


```


## Illustrations / Photos


### TinkerKit Linear Potentiometer



![docs/images/tinkerkit-linear-pot.png](images/tinkerkit-linear-pot.png)  






## Additional Notes
- [TinkerKit Linear Potentiometer](http://www.tinkerkit.com/linear-pot/)
- [TinkerKit Led](http://www.tinkerkit.com/led/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
