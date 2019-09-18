const { Boards, Led } = require("../lib/johnny-five.js");
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
