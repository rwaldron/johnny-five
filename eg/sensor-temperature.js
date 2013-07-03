
var five = require('johnny-five'),
    board, sensor;

board = new five.Board();

board.on('ready', function(){
    sensor = new five.Sensor({
        pin: 'A0',
        freq: 250
    });

    board.repl.inject({
        sensor: sensor
    });

    sensor.on('read', function(){
        var celsius = -(100 * (this.value / 1000) - 50);
        var fahrenheit = celsius * (9/5) + 32;

        console.log(celsius + '°C', fahrenheit + '°F');
    });
});

