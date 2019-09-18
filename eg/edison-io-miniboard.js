const { Board, Led } = require("../lib/johnny-five.js");
const Edison = require("edison-io");
const board = new Board({
  io: new Edison()
});

board.on("ready", () => {
  const led = new Led(1);
  led.blink();
});

/* @markdown

In order to use the Edison-IO library, you will need to flash the Intel IoTDevKit Image
on your Edison. Once the environment is created, install Johnny-Five and Edison-IO.

```sh
npm install johnny-five edison-io
```


@markdown */
