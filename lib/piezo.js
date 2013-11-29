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

  this.notes =  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Piezo instance properties
  this.playing = false;
}

util.inherits( Piezo, events.EventEmitter );

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
  var note, duration;
  var i = 0;

  // We are playing a song
  this.playing = true;

  function next() {
    note = tune[i];
    duration = beats[i] * tempo;

    if (i++ === tune.length) {
      // Song is over
      this.playing = false;
      return;
    }

    if (note === " ") {
      this.noTone();
      setTimeout(next.bind(this), duration);
    } else {
      var myNote = Piezo.Notes[note];
      this.tone(myNote, duration);
      setTimeout(next.bind(this), duration);
    }
  }

  next.call(this);
};

Piezo.prototype.noTone = function(){
  this.firmata.digitalWrite( this.pin, 0 );
};

module.exports = Piezo;
