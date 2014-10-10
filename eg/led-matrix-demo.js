var five = require("../lib/johnny-five");
var temporal = require("temporal");
var minimist = require("minimist");
var omits = minimist(process.argv.slice(2)).omit.split(",").map(Number);
var board = new five.Board();


board.on("ready", function() {

  var lc = new five.Led.Matrix({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    },
    devices: 2
  });

  lc.on();

  var delays = [
    // Rows: On, Off
    3000, 3000,
    // Columns: On, Off
    6000, 6000,
    // All: On, Pulse
    2000, 4000
  ];
  var fns = [
    // function() {
    //   for (var x = 0; x < 8; x++) {
    //     for (var y = 0; y < 8; y++) {
    //       lc.led(0, x, y, 1);
    //       lc.led(1, x, y, 1);
    //     }
    //   }
    // },
    // function() {
    //   for (var x = 0; x < 8; x++) {
    //     for (var y = 0; y < 8; y++) {
    //       lc.led(0, x, y, 0);
    //       lc.led(1, x, y, 0);
    //     }
    //   }
    // },
    function() {
      console.log("Row: 255");
      for (var x = 0; x < 8; x++) {
        lc.row(x, 255);
      }
    },
    function() {
      console.log("Row: 0");
      for (var x = 0; x < 8; x++) {
        lc.row(x, 0);
      }
    },
    function() {
      console.log("Column: 255");
      for (var y = 0; y < 8; y++) {
        lc.column(y, 255);
      }
    },
    function() {
      console.log("Column: 0");
      for (var y = 0; y < 8; y++) {
        lc.column(0, y, 0);
        lc.column(1, y, 0);
      }
    },
    function() {
      console.log("All on");

      lc.each(function(addr) {
        this.draw(addr, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      });
    },
    function() {
      console.log("Pulse");

      var brightness = 0;
      var direction = 1;

      temporal.loop(25, function() {
        brightness += direction * 20;
        lc.brightness(brightness);

        // console.log( "Call #%d set brightness to: %d", this.called, brightness );

        if (brightness === 100 || !brightness) {
          direction = !brightness ? 1 : -1;
        }

        if (this.called === 25) {
          lc.brightness(100);
          this.stop();
          demo();
        }
      });
    },
  ];

  function demo() {
    temporal.queue(
      fns.map(function(task, index) {
        return {
          delay: delays[index],
          task: task
        };
      }).filter(function(_, i) {
        return omits.indexOf(i) === -1;
      })
    );
  }

  demo();
});
