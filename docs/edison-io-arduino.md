<!--remove-start-->

# Led Blink on Intel Edison Arduino Board

<!--remove-end-->


Example using Johnny-Five + Edison-IO to directly control an Intel Edison





##### LED on pin 13



![docs/breadboard/led-13-edison-arduinoboard.png](breadboard/led-13-edison-arduinoboard.png)<br>

Fritzing diagram: [docs/breadboard/led-13-edison-arduinoboard.fzz](breadboard/led-13-edison-arduinoboard.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/edison-io-arduino.js
```


```javascript
const { Board, Led } = require("johnny-five");
const Edison = require("edison-io");
const board = new Board({
  io: new Edison()
});

board.on("ready", () => {
  const led = new Led(13);
  led.blink();
});


```


## Illustrations / Photos


### Intel Edison Arduino Board



![docs/images/edison-arduino-board.jpg](images/edison-arduino-board.jpg)  






## Additional Notes
In order to use the Edison-IO library, you will need to flash the Intel IoTDevKit Image
on your Edison. Once the environment is created, install Johnny-Five and Edison-IO.
```sh
npm install johnny-five edison-io
```


## Learn More

- [edison-io on GitHub](https://github.com/rwaldron/edison-io/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
