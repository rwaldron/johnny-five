<!--remove-start-->

# TinkerKit - Temperature





Run with:
```bash
node eg/tinkerkit-thermistor.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  new five.Temperature({controller: "TINKERKIT", pin: "I0"}).on("change", function() {
    console.log("F: ", this.fahrenheit);
    console.log("C: ", this.celsius);
  });
});


```


## Illustrations / Photos


### TinkerKit Temperature



![docs/images/tinkerkit-thermistor.png](images/tinkerkit-thermistor.png)  





## Additional Notes

- [TinkerKit Thermistor](http://www.tinkerkit.com/thermistor/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
