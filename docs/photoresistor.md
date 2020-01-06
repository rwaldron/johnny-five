<!--remove-start-->

# Sensor - Photoresistor

<!--remove-end-->






##### Breadboard for "Sensor - Photoresistor"



![docs/breadboard/photoresistor.png](breadboard/photoresistor.png)<br>

Fritzing diagram: [docs/breadboard/photoresistor.fzz](breadboard/photoresistor.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/photoresistor.js
```


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








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
