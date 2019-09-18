const Barcli = require("barcli");
const {Board, Button, Expander, Led, Leds, Sensor } = require("../lib/johnny-five.js");
const board = new Board({
  repl: false,
  debug: false
});

board.on("ready", () => {
  const activeLed = {
    last: -1,
    next: -1,
  };

  const virtual = new Board.Virtual(
    new Expander("MUXSHIELD2")
  );

  const leds = new Leds(
    Array.from({ length: 16 }, (_, index) => {
      const bar = new Barcli({ label: `IO3-${index}`, range: [0, 1] });
      const lit = new Sensor({
        type: "digital",
        pin: `IO3-${index}`,
        board: virtual,
      });

      const led = new Led({
        pin: `IO1-${index}`,
        board: virtual,
      });

      lit.on("data", () => {
        if (index === activeLed.last ||
            index === activeLed.next) {
          bar.update(lit.value);
        }
      });

      return led;
    })
  );

  const button = new Button(9);

  button.on("press", () => {
    activeLed.last = activeLed.next;

    if (activeLed.last !== -1) {
      leds[activeLed.last].off();
    }

    activeLed.next++;

    if (activeLed.next > 15) {
      activeLed.last = 15;
      activeLed.next = 0;
    }

    leds.off();
    leds[activeLed.next].on();
  });
});
