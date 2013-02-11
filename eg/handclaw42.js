var five = require("../lib/johnny-five.js"),
    child = require("child_process"),
    http = require("http"),
    socket = require("socket.io"),
    fs = require("fs"),
    app, board, io;

function handler( req, res ) {
  var path = __dirname;

  if ( req.url === "/" ) {
    path += "/handclaw42.html";
  } else {
    path += req.url;
  }

  fs.readFile( path, function( err, data ) {
    if ( err ) {
      res.writeHead( 500 );
      return res.end( "Error loading " + path );
    }

    res.writeHead( 200 );
    res.end( data );
  });
}

app = http.createServer( handler );
app.listen( 8080 );

io = socket.listen( app );
io.set( "log level", 1 );

board = new five.Board();

board.on("ready", function() {
var defs, servos;
  // http://www.ranchbots.com/robot_arm/images/arm_diagram.jpg
  defs = [

    // Pivot
    { id: "a", pin:  6, range: [  0, 180 ], at: 90 },
    // Shoulder
    { id: "b", pin:  9, range: [ 60, 150 ], at: 20 },
    // Elbow
    { id: "c", pin: 10, range: [  0, 120 ], at: 0 },
    // Wrist
    { id: "d", pin: 11, range: [  0, 180 ], at: 40 },
    // Grip
    { id: "e", pin: 12, range: [  0, 180 ], at: 0 }
  ];

  servos = {};

  defs.forEach(function( def ) {
    servos[def.id] = five.Servo( def ).move( def.at );
  });


  // Open Radar view
  console.log( "Opened Browser" );
  io.sockets.on( "connection", function( socket ) {
    console.log( "Socket Connected" );
    defs.forEach(function( key ) {
      socket.emit('createServo', {servo: key.id, min: key.range[0], max: key.range[1]});
    });
    socket.on('range', function(data) {
      servos[data.servo].move(data.value);
    });
  });
});


// // Reference
// //
// // http://www.maxbotix.com/pictures/articles/012_Diagram_690X480.jpg
