<!--remove-start-->

# Led Blink on Raspberry Pi


Example using Johnny-Five + Raspi-IO to directly control a Raspberry Pi


Run with:
```bash
node eg/raspi-io.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  var led = new five.Led("P1-13");
  led.blink();
});


```


## Illustrations / Photos


### LED on pin P1-13



![docs/breadboard/led-13-raspberry-pi.png](breadboard/led-13-raspberry-pi.png)<br>

Fritzing diagram: [docs/breadboard/led-13-raspberry-pi.fzz](breadboard/led-13-raspberry-pi.fzz)

&nbsp;





## Additional Notes

In order to use the Raspi-IO library, it is recommended that you use
the Raspbian OS. Others may work, but are untested.

```sh
npm install johnny-five raspi-io
```




## Learn More

- [raspi-io on GitHub](https://github.com/bryan-m-hughes/raspi-io/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
