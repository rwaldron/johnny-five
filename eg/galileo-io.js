const { Board, Led } = require("../lib/johnny-five.js");
const Galileo = require("galileo-io");
const board = new Board({
  io: new Galileo()
});

board.on("ready", () => {
  const led = new Led(13);
  led.blink();
});

/* @markdown

In order to use the Galileo-IO library, you will need to flash the Intel IoTDevKit Image
on your Galileo Gen 2. Once the environment is created, install Johnny-Five and Galileo-IO.

```sh
npm install johnny-five galileo-io
```


@markdown */
