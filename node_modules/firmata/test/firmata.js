/*
    Tests performed with arduino Uno and firmata 2.2
*/
var assert = require('assert'),
    firmata = require('firmata'),
    async = require('async');
var board = new firmata.Board('/dev/tty.usbmodemfa131', function(error) {
    if (error) {
        console.log(error);
    } else {
        console.log('connected');
        exports['Test Connection'] = function() {
            assert.ok(true, 'We connected');
        };
        exports['Test Version'] = function() {
            assert.ok(board.version.major == 2, 'major version is 2');
            assert.ok(board.version.minor == 2, 'minor version is 2');
        };
        exports['Test Capabilities'] = function() {
            assert.ok(board.pins[0].supportedModes.length === 0, '0 is a serial pin');
            assert.ok(board.pins[1].supportedModes.length === 0, '1 is a serial pin');
            for (var i = 2, length = board.pins.length; i < length; i++) {
                //if the analogChannel is 127 then its a digital pin and it supports board.INPUT board.OUTPUT board.PWM and board.SERVO
                if (board.pins[i].supportedModes.length === 0) continue;
                if (board.pins[i].analogChannel == 127) {
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.INPUT) > -1, 'Pin has INPUT');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.OUTPUT) > -1, 'Pin has OUTPUT');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.PWM) > -1, 'Pin has PWM');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.SERVO) > -1, 'Pin has Servo');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.ANALOG) == -1, 'Pin does not have Analog');
                    //on arduino uno there are Analog 6 and 7 which are analog only
                } else if (board.pins[i].analogChannel > 5) {
                    assert.ok(board.pins[i].supportedModes.length == 1, 'Only one mode');
                    assert.ok(board.pins[i].supportedModes[0] == board.MODES.ANALOG, 'Only analog');

                    //else its analog and it supported board.INPUT, board.OUTPUT and board.PWM but no board.SERVO
                } else if (board.pins[i].analogChannel > 0) {
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.INPUT) > -1, 'Pin has INPUT');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.PWM) > -1, 'Pin has PWM');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.OUTPUT) > -1, 'Pin has Output');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.ANALOG) > -1, 'Pin has Analog');
                    assert.ok(board.pins[i].supportedModes.indexOf(board.MODES.SERVO) == -1, 'Pin does not have Servo');
                }
            }
        };
        exports['Test Pin State'] = function() {
            assert.ok(board.pins[0].mode === 0, '0 is a serial pin');
            assert.ok(board.pins[1].mode === 0, '1 is a serial pin');
            for (var i = 2, length = board.pins.length; i < length; i++) {
                if (board.pins[i].supportedModes.length === 0) continue;
                //if its digital
                if (board.pins[i].analogChannel == 127) {
                    assert.ok(board.pins[i].mode == board.MODES.OUTPUT, 'Digital defaults to Output');
                }
                //else its analog
                else {
                    assert.ok(board.pins[i].mode == board.MODES.ANALOG, 'Analgo defaults to analog');
                }
            }
        };
        exports['Test Query Firmware'] = function() {
            board.queryFirmware(function() {
                assert.ok(true, 'Firmware queried');
            });
        };
        var analogRead = function(callback) {
                console.log('Connect photocell to analog 5');
                console.log('Testing in 15 seconds');
                var callbackCalled = false;
                setTimeout(function() {
                    console.log('Put your hand over light sensor');
                    board.pinMode(5, board.MODES.ANALOG);
                    board.analogRead(5, function(value) {
                        if (value < 500) {
                            if (!callbackCalled) {
                                callbackCalled = true;
                                callback(null, '1');
                            }
                        }
                    });
                }, 15000);
            };
        var digitalRead = function(callback) {
                console.log('Connect photocell to digital 8');
                console.log('Testing in 15 seconds');
                var callbackCalled = false;
                setTimeout(function() {
                    console.log('Put Your hand over light sensor');
                    board.pinMode(8, board.MODES.INPUT);
                    board.digitalRead(8, function(value) {
                        if (value == 0) {
                            if (!callbackCalled) {
                                callbackCalled = true;
                                callback(null, '2');
                            }
                        }
                    });
                }, 15000);
            };
        var readYes = function(callback) {
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.once('data', function(chunk) {
                    callback(null, chunk);
                });
            };
        var digitalWrite = function(callback) {
                console.log('Test Digital Write Connect LED to Pin 7');
                console.log('Testing in 15 seconds');
                setTimeout(function() {
                    console.log('Press Y if you see the light turn on');
                    board.pinMode(7, board.MODES.OUTPUT);
                    board.digitalWrite(7, board.HIGH);
                    callback(null, '3');
                }, 15000);
            };
        var analogWrite = function(callback) {
                console.log('Testing Analog Write Connect LED to Pin 9');
                console.log('Testing in 15 seconds');
                setTimeout(function() {
                    board.pinMode(9, board.MODES.PWM);
                    board.analogWrite(9, 255);
                    console.log('Press Y if you saw the light turn on');
                    callback(null, '4');
                }, 15000);
            };
        exports['Test Pins'] = function() {
            async.series([
            analogRead, digitalRead, digitalWrite, readYes, analogWrite, readYes], function(error, results) {
                assert.ok(true, 'Analog Read Succesful');
                assert.ok(true, 'Digital Read Successful');
                assert.ok(results[3] == 'Y\n', 'Digital Write Successful');
                assert.ok(results[5] == 'Y\n', 'Analog WRite Successful');
                process.exit();
            });
        };
    }
});