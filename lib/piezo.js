var Board = require("../lib/board.js"),
  Timer   = require("nanotimer");

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
  "c4": 262,
  "c#4": 277,
  "d4": 294,
  "d#4": 311,
  "e4": 330,
  "f4": 349,
  "f#4": 370,
  "g4": 392,
  "g#4": 415,
  "a4": 440,
  "a#4": 466,
  "b4": 494,
  "c5": 523,
  "c#5": 554,
  "d5": 587,
  "d#5": 622,
  "e5": 659,
  "f5": 698,
  "f#5": 740,
  "g5": 784,
  "g#5": 831,
  "a5": 880,
  "a#5": 932,
  "b5": 988,
  "c6": 1047
};

function clearTimer() {
  if(!this.timer) {
    return;
  }

  this.timer.clearInterval();
  delete this.timer;
}

/**
 * Get the tone from the current note. note 
 * could be an int, string, array or null.
 * If int or null, leave alone. Otherwise,
 * derive what the tone should be.
 * @return int | null
 */
function parseTone(note) {
  var tone = note;
  if (Array.isArray(note)) {
    tone = note[0];
  }
  if (typeof tone === "string") {
    tone = tone.toLowerCase();
    tone = (Piezo.Notes[tone]) ? Piezo.Notes[tone] : null;
  }
  return tone;
}

/**
 * Obtain the beat/duration count from the current
 * note. This is either an int or undefined. Default
 * to 1. 
 * @return int (default 1)
 */
function parseBeat(note) {
  var beat = 1;
  if (Array.isArray(note) && note[1] !== undefined) {
    // If extant, beat will be second element of note
    beat = note[1];
  }
  return beat;
}

Piezo.prototype.tone = function(tone, duration) {
  clearTimer.call(this);

  var timer = this.timer = new Timer();
  var value = 1;

  timer.setInterval(function() {
    value = value === 1 ? 0 : 1;
    this.io.digitalWrite(this.pin, value);

    if((timer.difTime / 1000000) > duration) {
      clearTimer.call(this);
    }
  }.bind(this), null, tone + "u", function() {});

  return this;
};

Piezo.prototype.frequency = function(frequency, duration) {
  var period = 1 / frequency;
  var duty = period / 2;
  var tone = Math.round(duty * 1000000);

  return this.tone(tone, duration);
};

Piezo.prototype.play = function(tune, callback) {
  if (typeof tune !== 'object') {
    tune = { song: tune };
  }
  var duration,
      tempo         = tune.tempo || 250,
      beatDuration  = Math.round(60000 / tempo), // Length for a single beat in ms
      song          = tune.song || [],
      i             = 0;
  if (song && !Array.isArray(song)) {
    song = [song];
  }
  var next = function() {
    var note, beat;
    
    note = parseTone(song[i]);
    beat = parseBeat(song[i]);

    duration = beat * beatDuration;

    if (i++ === song.length) {
      // Song is over
      this.isPlaying = false;
      if (typeof callback === 'function') {
        callback(tune);
      }
      return;
    }

    if (note === null) {
      this.noTone();
    } else {
      this.frequency(note, duration);
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
  clearTimer.call(this);

  return this;
};

Piezo.prototype.off = Piezo.prototype.noTone;

module.exports = Piezo;
