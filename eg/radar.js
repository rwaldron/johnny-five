(function( exports ) {

  // private: `radars` cache array for storing instances of Radar,

  var socket, radars, colors, addl;

  socket = io.connect("http://localhost");
  radars = [];
  colors = {
    // Color Constants
    yellow: "255, 255, 0",

    red: "255, 0, 0",

    green: "0, 199, 59",

    gray: "182, 184, 186"
  };
  addl = {
    distance: "cm",
    degrees: "°"
  };


  socket.on( "ping", function( data ) {
    if ( radars.length ) {
      radars[ 0 ].ping( data.degrees, data.distance );


      // TODO: This is bas
      Object.keys( data ).forEach(function( key ) {
        var node = document.querySelector( "#" + key );

        if ( node !== null ) {
          node.innerHTML = data[ key ] + addl[ key ];

          if ( node.dataset.moved === undefined ) {
            node.style.top = radars[ 0 ].height + "px";
            node.style.position = "relative";
            node.dataset.moved = true;
          }
        }
      });
    }
  });

  socket.on( "reset", function() {
    console.log( "reset" );
    radars.length = 0;

    Radar.create("#canvas");
  });


  // Radar Constructor
  function Radar( opts ) {
    var prop;

    // Iterate options, intialize as instance properties, assign value
    for ( prop in opts ) {
      this[ prop ] = opts[ prop ];
    }

    this.history = new Array(180);
    this.rendered = new Array(180);
    // this.remove = new Array(180);

    this.intervals = 0;
    this.grid().loop();
  }

  Radar.prototype = {

    reset: function() {
      this.ctx.clearRect(
        0, 0, this.ctx.canvas.width, this.ctx.canvas.height
      );
      this.intervals = 0;
      this.history.length = 0;
      this.rendered.length = 0;

      this.history = new Array(180);
      this.rendered = new Array(180);
      // this.remove = new Array(180);
      //
      console.log( "message" );
    },

    loop: function() {
      setInterval(function() {
        this.draw();


        // Reset every minute
        if ( ++this.intervals === 600 ) {
          this.reset();
        }
      }.bind(this), 50);
    },

    line: function( data, options ) {

      options = options || {};

      var width, height;

      width = this.ctx.canvas.width;
      height = this.ctx.canvas.height;


      // if ( options && options.clobber ) {
      //   this.ctx.arc(
      //     width / 2,
      //     height,

      //     data.distance,

      //     (Math.PI/180) * data.angle,
      //     (Math.PI/180) * data.angle + 0.009,

      //     true

      //   );

      //   // Set color of arc line
      //   this.ctx.strokeStyle = "white";
      //   // Set size of arc line
      //   this.ctx.lineWidth = 10;
      //   // Draw the line
      //   this.ctx.stroke();
      //   // Close the arc path
      //   this.ctx.closePath();
      // }


      this.ctx.moveTo(
        width / 2,
        height
      );

      this.ctx.lineTo(
        width / 2 + Math.cos( data.angle ) * data.distance,
        height + Math.sin( data.angle ) * data.distance
      );

      this.ctx.strokeStyle = options.color || data.color;
    },

    draw: function() {

      var width, height, data, k;

      width = this.ctx.canvas.width;
      height = this.ctx.canvas.height;

      this.ctx.clearRect( 0, 0, width, height );
      //

      k = 0;

      while ( k < 181 ) {

        if ( k in this.history ) {
          data = this.history[ k ];

          if ( !this.rendered[ k ] ) {
            this.line( data );
            this.rendered[ k ] = true;
            //"rgba(" + data.color + ", 1)";
          }
        }

        k++;
      }
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      this.ctx.closePath();

      return this;
    },

    ping: function( azimuth, distance ) {

      distance = Math.round(distance);

      // Calculate drawing angle
      var modified, angle, color, state;

      modified = azimuth - 90;
      angle = (Math.PI * 2) * (modified/360) - (Math.PI / 2);
      color = "blue";

      state = {
        angle: angle,
        distance: distance,
        color: color
      };

      // Draw
      // this.draw( angle, distance, colors[ color ], 1 );
      if ( typeof this.history[ azimuth ] === "undefined" ) {
        this.history[ azimuth ] = state;
      } else {

        // Update with new readings...
        if ( this.history[ azimuth ].distance !== distance ) {
          this.history[ azimuth ] = state;
          this.rendered[ azimuth ] = false;
        }
      }

      return this;
    },

    grid: function() {


      var ctx, line, i,
          grid = document.createElement("canvas"),
          dims = {
            width: null,
            height: null
          },
          canvas = this.ctx.canvas,
          stepx = 20,
          stepy = 20;

      grid.id = "radar_grid";
      // Setup position of grid overlay
      grid.style.position = "relative";
      grid.style.top = "-" + (canvas.height + 5) + "px";
      grid.style.zIndex = "9";


      // Setup size of grid overlay
      grid.width = canvas.width;
      grid.height = canvas.height;

      if ( document.querySelector("#radar_grid") === null ) {
        // Insert into DOM, directly following canvas to overlay
        canvas.parentNode.insertBefore( grid, canvas.nextSibling );
      } else {
        grid = document.querySelector("#radar_grid");
      }

      // Capture grid overlay canvas context
      ctx = grid.getContext("2d");


      ctx.strokeStyle = "lightgray";
      ctx.lineWidth = 0.5;

      // for ( i = stepx + 0.5; i < ctx.canvas.width; i += stepx ) {
      //   ctx.beginPath();
      //   ctx.moveTo( i, 0 );
      //   ctx.lineTo( i, ctx.canvas.height );
      //   ctx.stroke();
      // }

      // for ( i = stepy + 0.5; i < ctx.canvas.height; i += stepy ) {
      //   ctx.beginPath();
      //   ctx.moveTo( 0, i );
      //   ctx.lineTo( ctx.canvas.width, i );
      //   ctx.stroke();
      // }


      for ( i = 0; i <= 6; i++ ) {

        ctx.arc(
          grid.width / 2,
          grid.height,

          60 * i,

          Math.PI * 2, 0,
          true
        );
      }

      ctx.stroke();
      return this;
    }
  };



  Radar.create = function( selector ) {

    var node, opts;

    node = document.querySelector( selector );

    if ( node === null ) {
      throw new Error("Missing canvas");
    }

    opts = {};

    node.width = node.width || document.body.offsetWidth - 15;
    node.height = node.width / 2;

    // Assign a context to this radar, from the cache of contexts
    opts.ctx = node.getContext("2d");

    opts.diameter = opts.ctx.width;

    // Calculate this radar's radius - is used in arc drawing arguments
    opts.radius = opts.diameter / 2;

    radars.push( new Radar(opts) );

    // Return the newly created radar from the `radars` cache array
    return radars[ radars.length - 1 ];
  };

  // `radars` cache array access
  Radar.get = function( index ) {
    return index !== undefined && radars[ index ];
  };

  // Expose Radar API
  exports.Radar = Radar;

}( this ) );


$(function() {

  Radar.create( "#canvas" );

  var canvas = Radar.get(0).ctx.canvas;

  $(canvas).on("click", function() {
    var radar = Radar.get(0);

    radar.ctx.clearRect( 0, 0, canvas.width, canvas.height );

  });


  // console.log( radar );

  // // Test run
  // [
  //   [ 0, 50 ],
  //   [ 10, 70 ],
  //   [ 19, 200 ],
  //   [ 20, 250 ]
  // ].forEach(function( data ) {
  //   radar.ping( data[0], data[1] );
  // });

});
