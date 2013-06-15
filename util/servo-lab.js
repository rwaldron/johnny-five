var five = require("../lib/johnny-five.js"),
    args, servos;

/**
 * This program is useful for manual servo administration.
 *
 * ex. node eg/servo-lab.js [ pin list ]
 *
 *     To setup servos on pins 10 and 11:
 *
 *     node eg/servo-lab.js 10 11
 *
 *     To setup servos on pins 10 and 11 with custom ranges:
 *
 *     node eg/servo-lab.js 10:10:170 11
 *
 *     To setup continuous servos on pins 10 and 11:
 *
 *     node eg/servo-lab.js C10  C11
 *
 *     Note: Ranges default to 0-180
 *
 */

args = process.argv.slice(2);
servos = args.map(function( val ) {
  var servo = {};
  var isContinuous = val.charAt(0).toUpperCase() === "C";
  var vals = val.split(":").map(function(v) {
    if ( isContinuous ) {
      v = v.slice(1);
    }
    return +v;
  });

  servo.pin = vals[0];
  servo.range =  vals.length === 3 ?
    vals.slice(1) : [ 0, 180 ];

  if ( isContinuous ) {
    servo.type = "continuous";
  }

  return servo;
});

(new five.Board()).on("ready", function() {
  var s;

  // With each provided pin number, create a servo instance
  servos.forEach(five.Servo);

  s = new five.Servos();

  s.center();

  // Inject a Servo Array into the REPL as "s"
  this.repl.inject({
    s: s
  });
});
