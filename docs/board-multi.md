<!--remove-start-->

# Board - Multiple in one program

<!--remove-end-->






##### Breadboard for "Board - Multiple in one program"



![docs/breadboard/board-multi.png](breadboard/board-multi.png)<br>

Fritzing diagram: [docs/breadboard/board-multi.fzz](breadboard/board-multi.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/board-multi.js
```


```javascript
const { Boards, Led } = require("johnny-five");
const boards = new Boards(["A", "B"]);

// Create 2 board instances with IDs "A" & "B"
boards.on("ready", () => {

  // Both "A" and "B" are initialized
  // (connected and available for communication)

  // Access them by their ID:
  const led = new Led({
    board: boards.byId("A"),
    pin: 13,
  });

  led.blink();

  // |this| is an array-like object containing references
  // to each initialized board.
  boards.each(board => {
    if (board.id === "B") {
      // Initialize an Led instance on pin 13 of
      // each initialized board and strobe it.
      const led = new Led({
        pin: 13,
        board
      });

      led.blink();
    }
  });
});

/**
 * When initializing multiple boards with only an ID string,
 * the order of initialization and connection is the order
 * that your OS enumerates ports.
 *
 * Given the above program, "A" and "B" would be assigned as:
 *
 * A => /dev/cu.usbmodem411
 * B => /dev/cu.usbmodem621
 *
 *
 * You may override this by providing explicit port paths:
 *
 * var ports = [
 *   { id: "A", port: "/dev/cu.usbmodem621" },
 *   { id: "B", port: "/dev/cu.usbmodem411" }
 * ];
 *
 * new five.Boards(ports).on("ready", function() {
 *
 *   // Boards are initialized!
 *
 * });
 */

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
