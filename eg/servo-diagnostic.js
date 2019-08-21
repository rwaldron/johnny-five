const {Board, Servo, Servos} = require("../lib/johnny-five.js");

/**
 * This program is useful for manual servo administration.
 *
 * ex. node eg/servo-diagnostic.js [ pin list ]
 *
 *     To setup servos on pins 10 and 11:
 *
 *     node eg/servo-diagnostic.js 10 11
 *
 *     To setup servos on pins 10 and 11 with custom ranges:
 *
 *     node eg/servo-diagnostic.js 10:10:170 11
 *
 *     Note: Ranges default to 0-180
 *
 */

const args = process.argv.slice(2);
let pins = [];
let ranges = [];

args.forEach(val => {
  const vals = val.split(":").map(Number);

  pins.push(vals[0]);

  ranges.push(
    vals.length === 3 ?
    vals.slice(1) : [0, 180]
  );
});

const board = new Board();

board.on("ready", () => {
  // With each provided pin number, create a servo instance
  pins.forEach((pin, k) => {
    new Servo({
      pin,
      range: ranges[k]
    });
  });

  const servos = new Servos();

  servos.center();

  // Inject a Servo Array into the REPL
  board.repl.inject({
    servos
  });
});
