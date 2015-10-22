module.exports = function(five) {
  return (function() {

    function Component(opts) {
      if (!(this instanceof Component)) {
        return new Component(opts);
      }

      // Board.Component
      //    - Register the component with an
      //      existing Board instance.
      //
      // Board.Options
      //    - Normalize incoming options
      //      - Convert string or number pin values
      //        to `this.pin = value`
      //      - Calls an IO Plugin's `normalize` method
      //
      five.Board.Component.call(
        this, opts = five.Board.Options(opts)
      );


      // Define Component initialization

    }

    // Define Component Prototype


    return Component;
  }());
};


/**
 *  To use the plugin in a program:
 *
 *  var five = require("johnny-five");
 *  var Component = require("component")(five);
 *
 *
 */
