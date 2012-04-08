/**
 * Sample script to move a servo back and forth.
 */
var Board = require('../lib/firmata').Board;
var board = new Board('/dev/tty.usbmodemfa131', function() {
	var degrees = 10;
	var incrementer = 10;
	board.pinMode(9,board.MODES.SERVO);
	board.servoWrite(9,0);
	setInterval(function(){
		if(degrees >= 180 || degrees === 0){
			incrementer *= -1;
		}
		degrees += incrementer;
		board.servoWrite(9,degrees);
	},500)
});