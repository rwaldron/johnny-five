const Emitter = require("./mixins/emitter");
const repl = require("repl");
const priv = new Map();

// Ported from
// https://github.com/jgautier/firmata

class Repl extends Emitter {
  constructor(opts) {
    if (!Repl.isActive) {
      super();

      Repl.isActive = true;

      // Store context values in instance property
      // this will be used for managing scope when
      // injecting new values into an existing Repl
      // session.
      this.context = {};
      this.ready = false;

      const state = {
        opts,
        board: opts.board,
      };

      priv.set(this, state);

      // Store an accessible copy of the Repl instance
      // on a static property. This is later used by the
      // Board constructor to automattically setup Repl
      // sessions for all programs, which reduces the
      // boilerplate requirement.
      Repl.ref = this;
    } else {
      return Repl.ref;
    }
  }

  initialize(callback) {
    const state = priv.get(this);

    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const replDefaults = {
      prompt: ">> ",
      useGlobal: false
    };

    // Call this immediately before repl.start to
    // avoid crash on Intel Edison
    state.board.info("Repl", "Initialized");

    // Initialize the REPL session with the default
    // repl settings.
    // Assign the returned repl instance to "cmd"
    const cmd = repl.start(replDefaults);

    this.ready = true;

    // Assign a reference to the REPL's "content" object
    // This will be use later by the Repl.prototype.inject
    // method for allowing user programs to inject their
    // own explicit values and reference
    this.cmd = cmd;
    this.context = cmd.context;

    cmd.on("exit", () => {
      // Time to wait before forcing exit
      const failExitTimeout = 1000;

      state.board.emit("exit");
      state.board.warn("Board", "Closing.");

      // A fail safe timeout if 1 second to force exit.
      const timeout = setTimeout(() => {
        process.reallyExit();
      }, failExitTimeout);

      const interval = setInterval(() => {
        let pendingIo = false;
        // More than one board is attached, wait until everyone has no
        // io pending before exit.
        if (state.board.length) {
          for (let i = 0; i < state.board.length; i++) {
            if (state.board[i].io.pending) {
              pendingIo = true;
              break;
            }
          }
        }
        // Only one board connected, wait until there is no io pending before exit.
        else {
          pendingIo = state.board.io.pending;
        }

        if (!pendingIo) {
          clearInterval(interval);
          clearTimeout(timeout);
          process.nextTick(process.reallyExit);
        }
      }, 1);
    });

    this.inject(state.opts);

    /* istanbul ignore else */
    if (callback) {
      process.nextTick(callback);
    }
  }

  close() {
    this.cmd.emit("exit");
  }

  inject(obj) {
    Object.keys(obj).forEach(function(key) {
      Object.defineProperty(
        this.context, key, Object.getOwnPropertyDescriptor(obj, key)
      );
    }, this);
  }
}

Repl.isActive = false;
Repl.isBlocked = false;

// See Repl.ref notes above.
Repl.ref = null;

module.exports = Repl;
