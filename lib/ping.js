// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/ping.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Ping( opts ) {
  var hardware = Board.mount( opts );

  this.firmata = hardware.firmata;
  this.mode = this.firmata.MODES.OUTPUT;
  this.pin = opts && opts.pin || 7;

  // Set the pin to input mode
  // this.firmata.pinMode( this.pin, this.firmata.MODES.OUTPUT );

  this.firmata.pinMode( this.pin, this.mode );


  // Write pin LOW
  this.firmata.digitalWrite( this.pin, 1 );

  process.nextTick(function() {
    this.firmata.digitalWrite( this.pin, 1 );
  }.bind(this));


  // setInterval(function() {

  //   console.log( "fire loop" );
  //   // Prepare to write to the digital pin
  //   this.firmata.pinMode( this.pin, this.firmata.MODES.OUTPUT );


  //   // Write pin LOW
  //   this.firmata.digitalWrite( this.pin, 0 );
  //   // Wait 2ms, write pin HIGH
  //   setTimeout(function() {
  //     // console.log( 1, Date.now() );
  //     this.firmata.digitalWrite( this.pin, 1 );
  //   }.bind(this), 2);
  //   // Wait 5ms, write pin LOW
  //   setTimeout(function() {
  //     // console.log( 2, Date.now() );
  //     this.firmata.digitalWrite( this.pin, 0 );
  //   }.bind(this), 7);
  //   // Wait 2ms, chnage pinMode
  //   setTimeout(function() {
  //     // console.log( 3, Date.now() );
  //     this.firmata.pinMode( this.pin, this.firmata.MODES.INPUT );
  //   }.bind(this), 9);



  //   // this.firmata.digitalWrite( this.pin, this.firmata.HIGH );
  //   // this.firmata.digitalWrite( this.pin, this.firmata.LOW );

  //   // pinMode(p, OUTPUT);
  //   // digitalWrite(p, LOW);
  //   // delayMicroseconds(2);
  //   // digitalWrite(p, HIGH);
  //   // delayMicroseconds(5);
  //   // digitalWrite(p, LOW);

  //   // this.firmata.pinMode( this.pin, this.firmata.MODES.INPUT );
  // }.bind(this), 50);


  this.firmata.sp.on( "data", function( data ) {
    // console.log( data.toString().trim().length );
    // if ( data.toString().trim() ) {
    //   console.log( data.toString() );
    // }
  }.bind(this));

  // Digital Read event loop
  // TODO: make this "throttle-able"
  this.firmata.digitalRead( this.pin, function( data ) {
    this.emit( "read", data );
  }.bind(this));
}

util.inherits( Ping, events.EventEmitter );


module.exports = Ping;


//http://itp.nyu.edu/physcomp/Labs/Servo
//http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html
//http://protolab.pbworks.com/w/page/19403657/TutorialPings
