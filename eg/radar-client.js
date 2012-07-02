(function( exports, io ) {

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
    console.log("RESET");

    radars.length = 0;
    new Radar("#canvas");
  });


  // Radar Constructor
  function Radar( selector, opts ) {
    var node, k;

    if ( !(this instanceof Radar) ) {
      return new Radar( selector );
    }

    node = document.querySelector( selector );

    if ( node === null ) {
      throw new Error("Missing canvas");
    }

    opts = opts || {};

    this.direction = opts.direction || "forward";

    // Assign a context to this radar, from the cache of contexts
    this.ctx = node.getContext("2d");

    // Clear the canvas
    this.ctx.clearRect( 0, 0, node.width, node.height);

    // Store canvas width as diameter of arc
    this.diameter = this.ctx.width;

    // Calculate this radar's radius - is used in arc drawing arguments
    this.radius = this.diameter / 2;

    // Initialize step array
    this.steps = [ Math.PI ];

    // Calculate number of steps in sweep
    this.step = Math.PI / 180;

    // Fill in step start radians
    for ( k = 1; k < 180; k++ ) {
      this.steps.push( this.steps[ k - 1 ] + this.step );
    }

    // Set last seen angle to 0
    this.last = 0;

    // Draw the "grid"
    this.grid();

    radars.push( this );
  }

  Radar.prototype = {

    draw: function( distance, start, end ) {

      var x, y;

      x = this.ctx.canvas.width;
      y = this.ctx.canvas.height;


      this.ctx.beginPath();
      this.ctx.arc(
        x / 2,
        y,
        distance / 2,
        start,
        end,
        false
      );

      // Set color of arc line
      this.ctx.strokeStyle = "lightgreen";
      this.ctx.lineWidth = distance;

      // Commit the line and close the path
      this.ctx.stroke();
      this.ctx.closePath();

      return this;
    },

    ping: function( azimuth, distance ) {

      distance = Math.round( distance );


      // If facing forward, invert the azimuth value, as it
      // is actually moving 0-180, left-to-right
      if ( this.direction === "forward" ) {
        azimuth = Math.abs(azimuth - 180);

        // Normalize display from mid sweep, forward
        if ( this.last === 0 && azimuth < 175 ) {
          this.last = this.steps[ azimuth + 1 ];
        }

        this.draw( distance, this.steps[ azimuth ], this.last );
      } else {

        // Normalize display from mid sweep, backward
        if ( this.last === 0 && azimuth > 5 ) {
          this.last = this.steps[ azimuth - 1 ];
        }

        this.draw( distance, this.last, this.steps[ azimuth ] );
      }


      this.last = this.steps[ azimuth ];

      return this;
    },

    grid: function() {

      var ctx, line, i,
          grid = document.createElement("canvas"),
          gridNode = document.querySelector("#radar_grid"),
          dims = {
            width: null,
            height: null
          },
          canvas = this.ctx.canvas,
          radarDist = 0,
          upper = 340;


      if ( gridNode === null ) {
        grid.id = "radar_grid";
        // Setup position of grid overlay
        grid.style.position = "relative";
        grid.style.top = "-" + (canvas.height + 3) + "px";
        grid.style.zIndex = "9";


        // Setup size of grid overlay
        grid.width = canvas.width;
        grid.height = canvas.height;

        // Insert into DOM, directly following canvas to overlay
        canvas.parentNode.insertBefore( grid, canvas.nextSibling );

        // Capture grid overlay canvas context
        ctx = grid.getContext("2d");


        ctx.fillStyle = "black";
        ctx.fillRect( 0, 0, grid.width, grid.height);
        ctx.closePath();

        ctx.font = "bold 12px Helvetica";

        ctx.strokeStyle = "green";
        ctx.fillStyle = "green";
        ctx.lineWidth = 1;

        for ( i = 0; i <= 6; i++ ) {

          ctx.beginPath();
          ctx.arc(
            grid.width / 2,
            grid.height,

            60 * i,

            Math.PI * 2, 0,
            true
          );

          if ( i < 6 ) {
            ctx.fillText(
              radarDist + 60,
              grid.width / 2 - 7,
              upper
            );
          }

          ctx.stroke();
          ctx.closePath();
          upper -= 60;
          radarDist += 60;
        }
      }

      return this;
    }
  };




  // `radars` cache array access
  Radar.get = function( index ) {
    return index !== undefined && radars[ index ];
  };

  // Expose Radar API
  exports.Radar = Radar;

}( this, this.io ) );


document.addEventListener("DOMContentLoaded", function() {
  new Radar( "#canvas", {
    /**
     * direction
     *   forward  (facing away from controller)
     *   backward (facing controller)
     *
     * Defaults to "forward"
     *
     * @type {Object}
     */

    // direction: "forward"
  });
}, false);
