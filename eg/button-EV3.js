var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var leda = new five.Led(11);
  var ledb = new five.Led(10);

  var BAS1 = new five.Button({
    controller: "EV3",
    pin: "BAS1"
  });

  var BBS2 = new five.Button({
    controller: "EV3",
    pin: "BBS2"
  });

  BAS1.on("down", function(value) {
    leda.on();
  });

  BAS1.on("hold", function() {
    leda.blink(500);
  });

  BAS1.on("up", function() {
    leda.stop().off();
  });

  BBS2.on("down", function(value) {
    ledb.on();
  });

  BBS2.on("hold", function() {
    ledb.blink(500);
  });

  BBS2.on("up", function() {
    ledb.stop().off();
  });
});
