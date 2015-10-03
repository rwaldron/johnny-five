<!--remove-start-->

# Example plugin



Run with:
```bash
node eg/plugin.js
```

<!--remove-end-->

```javascript
var Board = require("board");

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
      Board.Component.call(
        this, opts = Board.Options(opts)
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

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
