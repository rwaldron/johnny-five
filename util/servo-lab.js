var five = require("../lib/johnny-five.js"),
    args, last, range, servos;

/**
 * This program is useful for manual servo administration.
 *
 * ex. node util/servo-lab.js [ pin list ]
 *
 *     To setup servos on pins 10 and 11:
 *
 *        node util/servo-lab.js 10 11
 *
 *     To setup servos on pins 10 and 11 with custom ranges:
 *
 *        node util/servo-lab.js 10:10:170 11
 *
 *     To setup continuous servos on pins 10 and 11:
 *
 *        node util/servo-lab.js C10  C11
 *
 *     Note: Ranges default to 0, 179
 *
 *     To setup a global range limit:
 *
 *        node util/servo-lab.js 9 R:45:135
 */

args = process.argv.slice(2);
last = args[args.length - 1];

if (last.indexOf("R:") === 0) {
  range = args.pop().replace("R:", "").split(":").map(Number);
}

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
    vals.slice(1) : (range ? range : [ 0, 180 ]);

  if ( isContinuous ) {
    servo.type = "continuous";
  }

  return servo;
});

// console.log( servos );
(new five.Board()).on("ready", function() {
  var s, i = 0;

  // With each provided pin number, create a servo instance
  servos.forEach(five.Servo);

  s = new five.Servos();

  s.center();

  // Inject a Servo Array into the REPL as "s"
  this.repl.inject({
    pins: this.pins,
    s: s,
    test: function(d, t) {
      if (!d) {
        d = 180;
      }
      if (!t) {
        t = 2000;
      }
      s[0].to(d, t);
    },
    sweep: function() {
      setInterval(function() {
        i = i === 0 ? 1 : 0;

        s[ i ? "max" : "min" ]();

      }, 1000);
    }
  });
});
