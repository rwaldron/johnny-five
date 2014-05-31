var repl = require("repl"),
  events = require("events"),
  util = require("util"),
  count = 1;

// Ported from
// https://github.com/jgautier/firmata

function Repl(opts) {
  if (!Repl.active) {
    Repl.active = true;

    if (!(this instanceof Repl)) {
      return new Repl(opts);
    }

    // Store context values in instance property
    // this will be used for managing scope when
    // injecting new values into an existing Repl
    // session.
    this.context = {};
    this.ready = false;

    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    // Create a one time data event handler for initializing
    // the repl session via keyboard input
    process.stdin.once("data", function() {
      var cmd, replDefaults;

      opts.board.info("Repl", "Initialized");

      replDefaults = {
        prompt: ">> ",
        useGlobal: false
      };

      // Initialize the REPL session with the default
      // repl settings.
      // Assign the returned repl instance to "cmd"
      cmd = repl.start(replDefaults);

      // Assign a reference to the REPL's "content" object
      // This will be use later by the Repl.prototype.inject
      // method for allowing user programs to inject their
      // own explicit values and reference
      this.context = cmd.context;

      cmd.on("exit", function() {
        opts.board.warn("Board", "Closing.");
        process.reallyExit();
      });

      this.emit("ready");

      // Inject the "opts" object into the repl context
      this.inject(opts);

    }.bind(this));

    // Store an accessible copy of the Repl instance
    // on a static property. This is later used by the
    // Board constructor to automattically setup Repl
    // sessions for all programs, which reduces the
    // boilerplate requirement.
    Repl.ref = this;
  }
}

// Inherit event api
util.inherits(Repl, events.EventEmitter);

Repl.active = false;

// See Repl.ref notes above.
Repl.ref = null;

Repl.prototype.inject = function(obj) {
  Object.keys(obj).forEach(function(key) {
    Object.defineProperty(
      this.context, key, Object.getOwnPropertyDescriptor(obj, key)
    );
  }, this);
};

Repl.isActive = false;
Repl.isBlocked = false;

module.exports = Repl;
