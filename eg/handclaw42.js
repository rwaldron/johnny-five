var five = require("../lib/johnny-five.js"),
  http = require("http"),
  socket = require("socket.io"),
  fs = require("fs"),
  app, board, io;

function handler(req, res) {
  var path = __dirname;

  if (req.url === "/") {
    path += "/handclaw42.html";
  } else {
    path += req.url;
  }

  fs.readFile(path, function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading " + path);
    }

    res.writeHead(200);
    res.end(data);
  });
}

app = http.createServer(handler);
app.listen(8080);

io = socket.listen(app);
io.set("log level", 1);

board = new five.Board();

board.on("ready", function() {
  var defs, servos;

  // http://www.ranchbots.com/robot_arm/images/arm_diagram.jpg
  defs = [
    // Pivot/Rotator
    {
      id: "rotator",
      pin: 6,
      range: [10, 170],
      startAt: 90
    },
    // Shoulder
    {
      id: "shoulder",
      pin: 9,
      range: [20, 150],
      startAt: 90
    },
    // Elbow
    {
      id: "elbow",
      pin: 10,
      range: [10, 120],
      startAt: 90
    },
    // Wrist
    {
      id: "wrist",
      pin: 11,
      range: [10, 170],
      startAt: 40
    },
    // Grip
    {
      id: "claw",
      pin: 12,
      range: [10, 170],
      startAt: 0
    }
  ];

  // Reduce the des array into an object of servo instances,
  // where the servo id is the property name
  servos = defs.reduce(function(accum, def) {
    return (accum[def.id] = five.Servo(def)) && accum;
  }, {});

  io.sockets.on("connection", function(socket) {
    defs.forEach(function(key) {
      socket.emit("createServo", {
        id: key.id,
        min: key.range[0],
        max: key.range[1]
      });
    });
    socket.on("range", function(data) {
      servos[data.id].to(data.value);
    });
  });
});
