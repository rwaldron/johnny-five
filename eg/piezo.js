var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {
  // Creates a piezo object and defines the pin to be used for the signal
  var piezo = new five.Piezo(3);

  // Injects the piezo into the repl
  board.repl.inject({
    piezo: piezo
  });

  // Plays a song
  piezo.play({
    // song is composed by an array of pairs of notes and beats
    // The first argument is the note (null means "no note")
    // The second argument is the length of time (beat) of the note (or non-note)
    song: [
      ["C4", 1],
      ["D4", 1],
      ["F4", 1],
      ["D4", 1],
      ["A4", 1],
      [null, 1],
      ["A4", 4],
      ["G4", 4],
      [null, 2],
      ["C4", 1],
      ["D4", 1],
      ["F4", 1],
      ["D4", 1],
      ["G4", 1],
      [null, 1],
      ["G4", 4],
      ["F4", 4],
      [null, 2]
    ],
    tempo: 150
  });

});
