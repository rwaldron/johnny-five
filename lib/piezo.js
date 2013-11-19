var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    Timer = require("nanotimer");

function Piezo( opts ) {

  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.OUTPUT;
  this.pin = opts.pin || 3;

  this.notes = {
    "c": 1915,
    "d": 1700,
    "e": 1519,
    "f": 1432,
    "g": 1275,
    "a": 1136,
    "b": 1014,
    "C": 956
  };

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Piezo instance properties
  this.interval = null;

  this.playing = false;

  this.queue = [];
}

util.inherits( Piezo, events.EventEmitter );

Piezo.prototype.tone = function( tone, duration ) {
  var timer = new Timer();
  var value = 1;

  timer.setInterval(function () {
      value = value === 1 ? 0 : 1;
      this.firmata.digitalWrite( this.pin, value );
    }.bind(this), null, tone + 'u', function () {});

  timer.setTimeout(function () {
    timer.clearInterval();
  }.bind(this), null, duration + 'm');
};

Piezo.prototype.song = function( tune, beats ){

  var tempo = 150;
  var self = this;
  var note, duration;
  var i = 0;

  function next(){
    note = tune[i];
    duration = beats[i] * tempo;

    if (i++ === tune.length) {
      return;
    }

    if (note === " ") {
      self.noTone();
      setTimeout(next, duration);
    } else {
      var myNote = self.notes[note];
      self.tone(myNote, duration);
      setTimeout(next, duration);
    }
  }

  next();
};

Piezo.prototype.noTone = function(){
  this.firmata.digitalWrite( this.pin, 0 );
};

module.exports = Piezo;
