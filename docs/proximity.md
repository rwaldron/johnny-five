<!--remove-start-->

# Infrared


Basic infrared Proximity example


Run with:
```bash
node eg/proximity.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
  prox, led;

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    pin: "A0",
    controller: "OA41SK"
  });

  proximity.on("data", function(data) {
    console.log(data.cm + "cm");
  });

});

```


## Illustrations / Photos


### Breadboard for "Infrared"



![docs/breadboard/proximity.png](breadboard/proximity.png)<br>
Fritzing diagram: [docs/breadboard/proximity.fzz](breadboard/proximity.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
