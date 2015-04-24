var Board = require("../lib/board.js"),
  Timer = require("nanotimer"),
  _ = require("lodash");

function Piezo(opts) {
  Board.Component.call(this, opts = Board.Options(opts));

  this.mode = this.io.MODES.OUTPUT;
  this.pin = opts.pin || 3;
  this.isPlaying = false;

  this.defaults = opts.defaults || {
    octave: 4,
    duration: 500,
    beat: 1 / 2,
    tempo: 125
  };

  return this.io.pinMode(this.pin, this.mode);
}

function clearTimer() {
  if (this.timer) {
    this.timer.clearInterval();
    delete this.timer;
  }
}

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
  "b8": 7902
};

Piezo.Beats = {
  "2": 2,
  "4": 1,
  "8": 1 / 2,
  "16": 1 / 4
};

Piezo.normalizeTempo = function(tempo) {
  if (isNaN(tempo) || tempo > 400 || tempo < 40) {
    return null;
  }

  return tempo;
};

Piezo.normalizeBeat = function(beat) {
  if (!beat || isNaN(beat)) {
    return null;
  }

  var normalizedBeat = null;
  _.forEach(Object.keys(Piezo.Beats), function(beatElement) {
    if (beatElement === beat.toString()) {
      normalizedBeat = Piezo.Beats[beatElement];
    }
  });

  return normalizedBeat;
};

Piezo.normalizeOctave = function(octave) {
  if (octave === "" || isNaN(octave) || octave < 0 || octave > 8) {
    return null;
  }

  return octave;
};

Piezo.normalizeNote = function(note, defaults) {
  if (typeof note !== "string") {
    return null;
  }

  defaults = defaults || {
    octave: "4",
    beat: 1/2
  };

  var normalizedNote = {};

  if (note.length === 3) {
    normalizedNote.beat = Piezo.normalizeBeat(note[0]) || defaults.beat;
    normalizedNote.notation = note[1];
    normalizedNote.octave = Piezo.normalizeOctave(note[2]) || defaults.octave;

    return normalizedNote;
  }

  if (note.length === 1) {
    normalizedNote.notation = note[0];
    normalizedNote.beat = defaults.beat;
    normalizedNote.octave = defaults.octave;

    return normalizedNote;
  }

  if (note.length === 2) {
    if (isNaN(note[0])) {
      normalizedNote.notation = note[0];
      normalizedNote.octave = note[1];
      normalizedNote.beat = defaults.beat;
    } else {
      normalizedNote.beat = note[0];
      normalizedNote.octave = defaults.octave;
      normalizedNote.notation = note[1];
    }

    return normalizedNote;
  }
};

Piezo.normalizeMelody = function(melody, defaults) {
  if (!melody) {
    return null;
  }

  if (typeof melody === "string") {
    var melodyObject = {
      sheet: melody
    };

    melody = melodyObject;
  }

  if (typeof melody.sheet !== "string") {
    return null;
  }

  defaults = defaults || {
    octave: 4,
    duration: 500,
    beat: 1 / 2,
    tempo: 125
  };

  // 1. remove colons and semi-colons
  // 2. remove additional whitespace
  // 3. clean up defaults if present.
  melody.sheet = melody.sheet.replace(/,|:/g, " ");
  melody.sheet = melody.sheet.replace(/\s{2,}/g, " ");
  melody.sheet = melody.sheet.replace(/\s{1,}=|=\s{1,}/g, "=");

  // Ensure we have defaults properly set up.
  melody.notes = melody.notes = [];
  melody.octave = melody.octave || defaults.octave;
  melody.beat = melody.beat || defaults.beats;
  melody.tempo = melody.tempo || defaults.tempo;

  // The sheet can contain defaults for beat (b=), octave (o=),
  // and tempo (t=). They always come before the first note.
  var sheetElements = melody.sheet.match(/\S+/g) || [];
  _.forEach(sheetElements, function(element) {
    if ((element.indexOf("b=") > -1 && melody.sheet.indexOf("t=") > -1) ||
        (element.indexOf("d=") > -1 && melody.sheet.indexOf("b=") > -1)) {
      var beatValue = element.substring(2);
      return melody.beat = Piezo.normalizeBeat(beatValue) || melody.beat;
    }

    if (element.indexOf("o=") > -1) {
      var octaveValue = element.substring(2);
      return melody.octave = Piezo.normalizeOctave(octaveValue) || melody.octave;
    }

    if ((element.indexOf("t=") > -1 && melody.sheet.indexOf("b=") > -1) ||
        (element.indexOf("b=") > -1 && melody.sheet.indexOf("d=") > -1)) {
      var tempoValue = element.substring(2);
      return melody.tempo = Piezo.normalizeTempo(tempoValue) || melody.tempo;
    }

    var note = Piezo.normalizeNote(element, melody);
    if (note) {
      melody.notes.push(note);
    }
  });

  // single beat in millisec"s based on tempo.
  melody.singleBeatDuration = Math.round(60000 / melody.tempo);

  return melody;
};

Piezo.frequencyToPulse = function(frequency) {
  if (!frequency || frequency === "" || isNaN(frequency)) {
    return null;
  }

  var period = 1 / frequency;
  var duty = (period) / 2;
  var pulse = Math.round(duty * 1000000);

  return pulse;
};

Piezo.frequencyToNote = function(frequency) {
  if (isNaN(frequency)) {
    return null;
  }

  // To Implement
};

Piezo.noteToPulse = function(note) {
  var frequency = this.noteToFrequency(note);
  var pulse = this.frequencyToPulse(frequency);

  return pulse;
};

Piezo.noteToFrequency = function(note) {
  var frequency = null;

  note = Piezo.normalizeNote(note);
  if (note) {
    var octavedNote = note.notation + note.octave;
    if (Piezo.Notes[octavedNote]) {
      frequency = Piezo.Notes[octavedNote];
    }
  }

  return frequency;
};

Piezo.prototype.playFrequency = function(frequency, duration) {
  duration = duration || this.defaults.duration;

  if (isNaN(frequency) || isNaN(duration)) {
    this.clearTone();
  }

  var pulse = this.frequencyToPulse(frequency);

  return this.pulsePin(pulse, duration);
};

Piezo.prototype.playNote = function(note, duration) {
  note = Piezo.normalizeNote(note);
  duration = duration || this.defaults.duration;

  if (!note || isNaN(duration)) {
    this.clearTone();
  }

  var pulse = this.noteToPulse(note);

  return this.pulsePin(pulse, duration);
};

Piezo.prototype.playMelody = function(melody, callback) {
  melody = Piezo.normalizeMelody(melody);

  if (!melody) {
    return callback(new Error("Piezo.playMelody invalid melody"));
  }

  var playNextNote = function() {
    // play each note here
    callback(null);
  };

  this.isPlaying = true;
  playNextNote();
};

Piezo.prototype.pulse = function(pulse, duration) {
  duration = duration || this.defaults.duration;

  if (isNaN(pulse) || isNaN(duration)) {
    this.clearTone();
  }

  clearTimer.call(this);
  var durationTimer = this.timer = new Timer();

  var pinState = 1;
  var onPulse = function() {
    pinState = pinState === 1 ? 0 : 1;
    this.io.digitalWrite(this.pin, pinState);

    var timeRunning = durationTimer.difTime / 1000000;
    if (timeRunning > duration) {
      clearTimer.call(this);
    }
  }.bind(this);

  var pulseInterval = pulse + "u";
  durationTimer.setInterval(onPulse, null, pulseInterval);

  return this;
};

Piezo.prototype.stop = function() {
  this.io.digitalWrite(this.pin, 0);
  clearTimer.call(this);

  return this;
};

// Sunset
function parseTone(note) {
  var tone = note;
  if (Array.isArray(note)) {
    tone = note[0];
  }
  if (typeof tone === "string") {
    tone = tone.toLowerCase();

    var needsOctave = isNaN(tone.substr(tone.length - 1));
    if (needsOctave) {
      tone = tone + Piezo.prototype.defaultOctave().toString();
    }

    tone = (Piezo.Notes[tone]) ? Piezo.Notes[tone] : null;
  }
  if (isNaN(tone)) {
    tone = null;
  }
  return tone;
}

// Sunset
function parseBeat(note) {
  var beat = 1;
  if (Array.isArray(note) && note[1] !== undefined) {
    // If extant, beat will be second element of note
    beat = note[1];
  }
  return beat;
}

// Sunset
function isValidOctave(octave) {
  // octave should be a number.
  if (octave && !isNaN(octave) &&
    (octave >= 0 && octave <= 8)) {
    return true;
  }

  return false;
}

// Sunset
function stringToSong(stringSong, beats) {
  beats = beats || 1;
  var notes = stringSong.match(/\S+/g);
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
}

// Sunset
Piezo.prototype.defaultOctave = function(octave) {
  if (typeof this.defaultOctave.value === "undefined") {
    this.defaultOctave.value = 4;
  }

  if (isValidOctave(octave)) {
    this.defaultOctave.value = octave;
  }

  return this.defaultOctave.value;
};

// Sunset
Piezo.prototype.note = function(note, duration) {
  var tone = parseTone(note);

  return this.tone(tone, duration);
};

// Sunset
Piezo.prototype.tone = function(tone, duration) {
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
};

// Sunset
Piezo.prototype.frequency = function(frequency, duration) {
  var period = 1 / frequency;
  var duty = period / 2;
  var tone = Math.round(duty * 1000000);

  return this.tone(tone, duration);
};

// Sunset
Piezo.prototype.play = function(tune, callback) {
  if (typeof tune !== "object") {
    tune = {
      song: tune
    };
  }
  if (typeof tune.song === "string") {
    tune.song = stringToSong(tune.song, tune.beats);
  }
  var duration,
    tempo = tune.tempo || 250,
    beatDuration = Math.round(60000 / tempo), // Length for a single beat in ms
    song = tune.song || [],
    i = 0;
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
      if (typeof callback === "function") {
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

// Sunset
Piezo.prototype.noTone = function() {
  this.io.digitalWrite(this.pin, 0);
  clearTimer.call(this);

  return this;
};

// Sunset
Piezo.prototype.off = Piezo.prototype.noTone;

module.exports = Piezo;
