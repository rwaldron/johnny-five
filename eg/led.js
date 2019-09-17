const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const led = new Led(13);

  // This will grant access to the led instance
  // from within the REPL that's created when
  // running this program.
  board.repl.inject({
    led
  });

  led.blink();
});
/* @markdown
This script will make `led` available in the REPL, by default on pin 13.
Now you can try, e.g.:

```js
>> led.stop() // to stop blinking
then
>> led.off()  // to shut it off (stop doesn't mean "off")
then
>> led.on()   // to turn on, but not blink
```

@markdown */
