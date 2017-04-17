var Board = require("./board");
var Timer = require("nanotimer");

var MICROSECONDS_PER_SECOND = 1000000;
var priv = new Map();
var defaultOctave = 4;

function clearTimer() {
  if (!this.timer) {
    return;
  }

  this.timer.clearInterval();
  delete this.timer;
}

var Controllers = {
  /**
   * Timer-based tone generator using digital high/low piezo.
   */
  DEFAULT: {
    initialize: {
      writable: true,
      value: function() {
        this.io.pinMode(this.pin, this.io.MODES.OUTPUT);
      },
    },
    tone: {
      writable: true,
      value: function(tone, duration) {
        if (isNaN(tone) || isNaN(duration)) {
          // Very Bad Things happen if one tries to play a NaN tone
          throw new Error(
            "Piezo.tone: invalid tone or duration"
          );
        }

        clearTimer.call(this);

        var timer = this.timer = new Timer();
        var value = 1;

        timer.setInterval(function() {
          value = value === 1 ? 0 : 1;
          this.io.digitalWrite(this.pin, value);

          if ((timer.difTime / 1000000) > duration) {
            clearTimer.call(this);
          }
        }.bind(this), null, tone + "u", function() {});

        return this;
      },
    },
    noTone: {
      writable: true,
      value: function() {
        this.io.digitalWrite(this.pin, 0);
        clearTimer.call(this);

        return this;
      },
    },
  },

  I2C_BACKPACK: {
    ADDRESSES: {
      value: [0x0A]
    },
    REGISTER: {
      value: {
        NO_TONE: 0x00,
        TONE: 0x01,
      },
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var address = opts.address || this.ADDRESSES[0];

        state.address = opts.address = address;

        this.io.i2cConfig(opts);
      }
    },
    tone: {
      value: function(tone, duration) {
        var state = priv.get(this);

        if (isNaN(tone) || isNaN(duration)) {
          throw new Error(
            "Piezo.tone: invalid tone or duration"
          );
        }

        var data = [
          this.REGISTER.TONE,
          this.pin,
          (tone >> 8) & 0xff,
          tone & 0xff,
          (duration >> 24) & 0xff,
          (duration >> 16) & 0xff,
          (duration >> 8) & 0xff,
          duration & 0xff,
        ];

        this.io.i2cWrite(state.address, data);

        return this;
      },
    },
    noTone: {
      value: function() {
        var state = priv.get(this);

        var data = [
          this.REGISTER.NO_TONE,
          this.pin,
        ];

        this.io.i2cWrite(state.address, data);

        return this;
      },
    },
  },
};

function Piezo(opts) {

  if (!(this instanceof Piezo)) {
    return new Piezo(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var controller = null;

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers.DEFAULT;
  }

  Object.defineProperties(this, controller);

  Board.Controller.call(this, controller, opts);

  // Piezo instance properties
  var state = {
    isPlaying: false,
    timeout: null,
    address: null,
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    isPlaying: {
      get: function() {
        return state.isPlaying;
      }
    }
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts);
  }
}

// These notes are rounded up at .5 otherwise down.
Piezo.Notes = {
  "c0": 16,
  "c#0": 17,
  "d0": 18,
  "d#0": 19,
  "e0": 21,
  "f0": 22,
  "f#0": 23,
  "g0": 25,
  "g#0": 26,
  "a0": 28,
  "a#0": 29,
  "b0": 31,
  "c1": 33,
  "c#1": 35,
  "d1": 37,
  "d#1": 39,
  "e1": 41,
  "f1": 44,
  "f#1": 47,
  "g1": 49,
  "g#1": 52,
  "a1": 55,
  "a#1": 58,
  "b1": 62,
  "c2": 65,
  "c#2": 69,
  "d2": 73,
  "d#2": 78,
  "e2": 82,
  "f2": 87,
  "f#2": 93,
  "g2": 98,
  "g#2": 104,
  "a2": 110,
  "a#2": 117,
  "b2": 124,
  "c3": 131,
  "c#3": 139,
  "d3": 147,
  "d#3": 156,
  "e3": 165,
  "f3": 175,
  "f#3": 185,
  "g3": 196,
  "g#3": 208,
  "a3": 220,
  "a#3": 233,
  "b3": 247,
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
  "c6": 1047,
  "c#6": 1109,
  "d6": 1175,
  "d#6": 1245,
  "e6": 1319,
  "f6": 1397,
  "f#6": 1480,
  "g6": 1568,
  "g#6": 1661,
  "a6": 1760,
  "a#6": 1865,
  "b6": 1976,
  "c7": 2093,
  "c#7": 2217,
  "d7": 2349,
  "d#7": 2489,
  "e7": 2637,
  "f7": 2794,
  "f#7": 2960,
  "g7": 3136,
  "g#7": 3322,
  "a7": 3520,
  "a#7": 3729,
  "b7": 3951,
  "c8": 4186,
  "c#8": 4435,
  "d8": 4699,
  "d#8": 4978,
  "e8": 5274,
  "f8": 5588,
  "f#8": 5920,
  "g8": 6272,
  "g#8": 6645,
  "a8": 7040,
  "a#8": 7459,
  "b8": 7902,
};

Piezo.Frequencies = Object.keys(Piezo.Notes).reduce(function(accum, note) {
  accum[Piezo.Notes[note]] = note;
  return accum;
}, {});

Piezo.Parsers = {};
/**
 * Get the tone from the current note. note
 * could be an int, string, array or null.
 * If int or null, leave alone. Otherwise,
 * derive what the tone should be.
 * @return int | null
 */
Piezo.Parsers.hzFromInput = function(input) {
  var output = input;

  if (Array.isArray(input)) {
    output = input[0];
  }

  // Is it a valid frequency?
  if (typeof output === "number" &&
      Piezo.Frequencies[output]) {
    return output;
  }

  // See above: Piezo.Notes { ... }
  if (typeof output === "string") {
    output = output.toLowerCase().trim();

    // Example: c#, c
    if (output.endsWith("#") || output.length === 1) {
      output += defaultOctave;
    }

    // There will never be a 0 tone
    output = Piezo.Notes[output] || null;
  }

  // Normalize NaN, null & undefined to null
  if (isNaN(output)) {
    output = null;
  }

  return output;
};

/**
 * Obtain the beat/duration count from the current
 * note. This is either an int or undefined. Default
 * to 1.
 * @return int (default 1)
 */
Piezo.Parsers.beatFromNote = function(note) {
  var beat = 1;
  if (Array.isArray(note) && note[1] !== undefined) {
    // If extant, beat will be second element of note
    beat = note[1];
  }
  return beat;
};

/**
 * Validate the octave provided to ensure the value is
 * supported and won't crash the board.
 * @return bool
 */
Piezo.isValidOctave = function(octave) {
  return typeof octave === "number" && (octave >= 0 && octave <= 8);
};

/**
 * Set or get a default octave for all notes
 * @return number
 */
Piezo.defaultOctave = function(octave) {
  if (Piezo.isValidOctave(octave)) {
    defaultOctave = octave;
  }

  return defaultOctave;
};

Piezo.ToFrequency = function(tone) {
  var toneSeconds = tone / MICROSECONDS_PER_SECOND;
  var period = toneSeconds * 2;
  return Math.round(1 / period);
};

Piezo.ToTone = function(frequency) {
  var period = 1 / frequency;
  var duty = period / 2;
  return Math.round(duty * MICROSECONDS_PER_SECOND);
};

Piezo.ToSong = function(stringSong, beats) {
  beats = beats || 1;
  var notes = stringSong.split(" ");
  var song = [];
  var note, lastNote;
  while (notes.length) {
    note = notes.shift();
    if (/^[0-9]+$/.test(note)) {
      note = parseInt(note, 10);
    }
    lastNote = song[song.length - 1];
    if (lastNote && lastNote[0] === note) {
      lastNote[1] += beats;
    } else {
      song.push([note, beats]);
    }
  }
  return song;
};

/**
 * Play a note for a duration.
 * @param {string} note - see Piezo.Notes.  Case-insensitive.
 *   If a note name without an octave number is given (e.g. "C#" instead of
 *   "C#4") then the configured default octave will be used.
 *   @see Piezo.prototype.defaultOctave
 * @param {number} duration - in milliseconds.
 */
Piezo.prototype.note = function(note, duration) {
  return this.frequency(Piezo.Parsers.hzFromInput(note), duration);
};

/**
 * Play a tone for a duration.
 * This is a lower-level method than frequency (which does
 * the translation from frequency to tone for you). Most of
 * the time you likely want to use frequency.
 * @param {number} tone - Given as a computed duty-cycle,
 *   in microseconds. Larger values produce lower tones.
 *   See https://en.wikipedia.org/wiki/Duty_cycle
 * @param {number} duration - in milliseconds.
 */
Piezo.prototype.tone = function(tone, duration) {
  return this.frequency(Piezo.ToFrequency(tone), duration);
};

/**
 * Play a frequency for a duration.
 * @param {number} frequency - in Hz
 * @param {number} duration - in milliseconds
 */
Piezo.prototype.frequency = function(frequency, duration) {
  return this.tone(Piezo.ToTone(frequency), duration);
};


Piezo.prototype.play = function(tune, callback) {
  if (typeof tune !== "object") {
    tune = {
      song: tune
    };
  }

  if (typeof tune.song === "string") {
    tune.song = Piezo.ToSong(tune.song, tune.beats);
  }

  if (tune.song && !Array.isArray(tune.song)) {
    /*
      If `tune.song` was present and not falsy,
      but also is not a string (above), or an array
      (presently), then it is likely a Hz value, so
      normalize song to the appropriate array format:
     */
    tune.song = [tune.song];
    /*
      Note: This path is taken for calls that look
      like this:

      piezo.play({
        song: 262,
      }, ...)

      Where 262 is a frequency in Hz
     */
  }

  var state = priv.get(this);
  var tempo = tune.tempo || 250;
  // Length for a single beat in ms
  var beatDuration = Math.round(60000 / tempo);
  var song = tune.song || [];
  var duration;
  var nextNoteIndex = 0;

  var next = function() {
    if (nextNoteIndex === song.length) {
      // No more notes in song:
      // Song is over
      state.isPlaying = false;
      if (typeof callback === "function") {
        callback(tune);
      }
      return;
    }

    var note = song[nextNoteIndex];
    var hz = Piezo.Parsers.hzFromInput(note);
    var beat = Piezo.Parsers.beatFromNote(note);

    duration = beat * beatDuration;
    nextNoteIndex++;

    if (hz === null) {
      this.noTone();
    } else {
      this.frequency(hz, duration);
    }

    state.timeout = setTimeout(next, duration);
  }.bind(this);

  // We are playing a song
  state.isPlaying = true;

  next();

  return this;
};

Piezo.prototype.off = function() {
  return this.noTone();
};

Piezo.prototype.stop = function() {
  var state = priv.get(this);

  /* istanbul ignore else */
  if (state.timeout) {
    clearTimeout(state.timeout);
    state.timeout = null;
  }

  return this;
};


module.exports = Piezo;
