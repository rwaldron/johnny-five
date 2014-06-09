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
  // The first argument is the notes of the song (space means "no note")
  // The second argument is the length of time (beats) each note (or non-note)
  // should play
  piezo.song("cdfda ag cdfdg gf ", "111111442111111442");
});
