var Board = require("../lib/board.js"),
  Timer = require("nanotimer");

function Piezo(opts) {

  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  // Hardware instance properties
  this.mode = this.io.MODES.OUTPUT;
  this.pin = opts.pin || 3;

  this.io.pinMode(this.pin, this.mode);

  // Piezo instance properties
  this.isPlaying = false;
}

Piezo.Notes = {
  "c": 1915,
  "d": 1700,
  "e": 1519,
  "f": 1432,
  "g": 1275,
  "a": 1136,
  "b": 1014,
  "C": 956
};

Piezo.prototype.tone = function(tone, duration) {
  var timer = new Timer();
  var value = 1;

  timer.setInterval(function() {
    value = value === 1 ? 0 : 1;
    this.io.digitalWrite(this.pin, value);
  }.bind(this), null, tone + "u", function() {});

  timer.setTimeout(function() {
    timer.clearInterval();
  }, null, duration + "m");

  return this;
};

Piezo.prototype.song = function(tune, beats) {
  var note, duration;
  var tempo = 150;
  var i = 0;
  var next = function() {
    var myNote;

    note = tune[i];
    duration = beats[i] * tempo;

    if (i++ === tune.length) {
      // Song is over
      this.isPlaying = false;
      return;
    }

    if (note === " ") {
      this.noTone();
    } else {
      myNote = Piezo.Notes[note];
      this.tone(myNote, duration);
    }

    setTimeout(next, duration);
  }.bind(this);

  // We are playing a song
  this.isPlaying = true;

  next();

  return this;
};

Piezo.prototype.noTone = function() {
  this.io.digitalWrite(this.pin, 0);
  return this;
};

Piezo.prototype.off = Piezo.prototype.noTone;

module.exports = Piezo;
