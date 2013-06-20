# Pin

Run with:
```bash
node eg/pin.js
```


```javascript
var five = require("johnny-five"),
    temporal = require("temporal");

(new five.Board()).on("ready", function() {
  var events, strobe;

  events = [];
  strobe = new five.Pin({
    addr: 13
  });

  temporal.loop(500, function( loop ) {
    strobe[ loop.called % 2 === 0 ? "high" : "low" ]();
  });


  // Event tests
  [ "high", "low" ].forEach(function( state ) {
    strobe.on( state, function() {
      if ( events.indexOf(state) === -1 ) {
        console.log( "Event emitted for:", state, "on", this.addr );
        events.push( state );
      }
    });
  });
});

```

## Breadboard/Illustration

![docs/breadboard/pin.png](breadboard/pin.png)
[docs/breadboard/pin.fzz](breadboard/pin.fzz)



## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
