<!--remove-start-->
# Sensor - Photoresistor

Run with:
```bash
node eg/photoresistor.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five"),
  board, photoresistor;

board = new five.Board();

board.on("ready", function() {

  // Create a new `photoresistor` hardware instance.
  photoresistor = new five.Sensor({
    pin: "A2",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: photoresistor
  });

  // "data" get the current reading from the photoresistor
  photoresistor.on("data", function() {
    console.log(this.value);
  });
});


// References
//
// http://nakkaya.com/2009/10/29/connecting-a-photoresistor-to-an-arduino/

```


## Breadboard/Illustration


![docs/breadboard/photoresistor.png](breadboard/photoresistor.png)
[(Fritzing diagram)](breadboard/photoresistor.fzz)





<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
