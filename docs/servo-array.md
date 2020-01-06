<!--remove-start-->

# Servos - An array of servos

<!--remove-end-->






##### Servos on pins 9 and 10


Servos connected to pins 9 and 10. Requires servos on pins that support PWM (usually denoted by ~).


![docs/breadboard/servo-two.png](breadboard/servo-two.png)<br>

Fritzing diagram: [docs/breadboard/servo-two.fzz](breadboard/servo-two.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/servo-array.js
```


```javascript
const {Board, Servos} = require("johnny-five");
const board = new Board();

board.on("ready", () => {

  // Initialize a Servo collection
  const servos = new Servos([9, 10]);

  servos.center();

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servos
  });


  // min()
  //
  // set all servos to the minimum degrees
  // defaults to 0
  //
  // eg. servos.min();

  // max()
  //
  // set all servos to the maximum degrees
  // defaults to 180
  //
  // eg. servos.max();

  // to( deg )
  //
  // set all servos to deg
  //
  // eg. servos.to( deg );

  // step( deg )
  //
  // step all servos by deg
  //
  // eg. servos.step( -20 );

  // stop()
  //
  // stop all servos
  //
  // eg. servos.stop();

  // each( callbackFn )
  //
  // Execute callbackFn for each active servo instance
  //
  // eg.
  // servos.each(function( servo, index ) {
  //
  //  `this` refers to the current servo instance
  //
  // });

});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
