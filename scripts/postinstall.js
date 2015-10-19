require("es6-shim");

var path = require("path");
var fs = require("fs");
var mv = require("mv");
var semver = require("semver");
var spawn = require("win-spawn");

var sp = {
  version: "1.7.4",
  get atVersion() {
    return "serialport@" + sp.version;
  },
};

if (semver.gte(process.version, "3.0.0")) {
  sp.version = "latest";
}

var sPath = path.join(process.cwd(), "node_modules", "firmata", "node_modules", "serialport");
var dPath = path.join(process.cwd(), "node_modules", "serialport");

fs.exists(sPath, function(exists) {
  if (exists) {
    mv(sPath, dPath, {mkdirp: true}, function(error) {
      if (error) {
        console.log("mv failed: ", error);
      }
    });
  } else {
    var npm = spawn("npm", ["install", sp.atVersion]);

    npm.stdout.on("data", function(data) {
      console.log(data.toString("utf8"));
    });

    npm.on("close", function(code) {
      if (code !== 0) {
        console.log("serialport installation failed. Error Code:", code);
      }
    });
  }
});

/*

  Q. Why is a postinstall script being used to negotiate and resolve
    the installation of node-serialport?

  A. Because package.json (and npm) does not support a mechanism
    that can be best illustrated with the following:

      // ...package.json
      "dependencies": {
        "serialport": {
          ">=2.0.0": ">=4.0.0",
          "1.7.4": ">=0.10.0"
        }
      }

      The above means: install node-serialport 1.7.4 if the version of Node.js is v0.10.0 or greater; install node-serialport v2.0.0 or greater if the current version of Node.js is v4.0.0 or greater;

    This requirement is NON NEGOTIABLE.

    One alternative that was suggested: use an intermediary module that attempts
    to install two modules:

      serialport-1
      serialport-2

    And produces whichever was successful. This is a nice solution that plays
    nicely within the package.json semantics, however it will always produce the failed
    installation report and all associated error output. In my experience, this
    frequently leads end developers to assume that the installation was a failure,
    even if it was only an optional dependency installation failure.
 */
