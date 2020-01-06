<!--remove-start-->

# Led Blink on Intel Galileo Gen 2

<!--remove-end-->


Example using Johnny-Five + Galileo-IO to directly control an Intel Galileo Gen 2





##### LED on pin 13



![docs/breadboard/led-13-galileo.png](breadboard/led-13-galileo.png)<br>

Fritzing diagram: [docs/breadboard/led-13-galileo.fzz](breadboard/led-13-galileo.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/galileo-io.js
```


```javascript
const { Board, Led } = require("johnny-five");
const Galileo = require("galileo-io");
const board = new Board({
  io: new Galileo()
});

board.on("ready", () => {
  const led = new Led(13);
  led.blink();
});


```


## Illustrations / Photos


### Galileo Gen 2



![docs/images/galileo-gen2.jpg](images/galileo-gen2.jpg)  






## Additional Notes
In order to use the Galileo-IO library, you will need to flash the Intel IoTDevKit Image
on your Galileo Gen 2. Once the environment is created, install Johnny-Five and Galileo-IO.
```sh
npm install johnny-five galileo-io
```


## Learn More

- [galileo-io on GitHub](https://github.com/rwaldron/galileo-io/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
