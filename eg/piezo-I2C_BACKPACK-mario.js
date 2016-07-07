var five = require("../lib/johnny-five.js");
// var board = new five.Board({port: "/dev/cu.usbmodem1421"});
var board = new five.Board();

board.on("ready", function() {
  var piezo = new five.Piezo({
    controller: "I2C_BACKPACK",
    pin: 4
  });

  five.Piezo.Notes["-"] = 0;

  var index = 0;

  function play() {

    if (index === melody.length) {
      process.exit();
    }

    var note = melody[index];
    var duration = Math.round(1000 / tempo[index]);
    var pauseBetween = Math.round(duration * 1.5);

    piezo.tone(five.Piezo.Notes[note], duration);

    index++;

    setTimeout(play, duration);
  }

  play();
});

var melody = [
  "e7", "e7", "-", "e7",
  "-", "c7", "e7", "-",
  "g7", "-", "-",  "-",
  "g6", "-", "-", "-",

  "c7", "-", "-", "g6",
  "-", "-", "e6", "-",
  "-", "a6", "-", "b6",
  "-", "a#6", "a6", "-",

  "g6", "e7", "g7",
  "a7", "-", "f7", "g7",
  "-", "e7", "-", "c7",
  "d7", "b6", "-", "-",

  "c7", "-", "-", "g6",
  "-", "-", "e6", "-",
  "-", "a6", "-", "b6",
  "-", "a#6", "a6", "-",

  "g6", "e7", "g7",
  "a7", "-", "f7", "g7",
  "-", "e7", "-", "c7",
  "d7", "b6", "-", "-",
];

// Mario Tempo
var tempo = [
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  9, 9, 9,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  9, 9, 9,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
];
