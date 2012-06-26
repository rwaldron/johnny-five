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
    console.log("RESET");

    radars.length = 0;
    Radar.create("#canvas");
  });


  // Radar Constructor
  function Radar( opts ) {
    var prop, k;

    // Iterate options, intialize as instance properties, assign value
    for ( prop in opts ) {
      this[ prop ] = opts[ prop ];
    }

    // Initialize step array
    this.steps = [ Math.PI ];

    // Calculate number of steps in sweep
    this.step = Math.PI / 180;

    // Fill in step widths
    for ( k = 0; k < 180; k++ ) {
      this.steps.push( this.steps[ k ] + this.step );
    }

    // Set last seen angle to 0
    this.last = 0;

    // Draw the "grid"
    this.grid();
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

      // When starting from mid sweep
      if ( this.last === 0 && azimuth > 5 ) {
        this.last = this.steps[ azimuth - 1 ];
      }

      this.draw( distance, this.last, this.steps[ azimuth ] );

      this.last = this.steps[ azimuth ];

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
          radarDist = 0,
          upper = 440;

      grid.id = "radar_grid";
      // Setup position of grid overlay
      grid.style.position = "relative";
      grid.style.top = "-" + (canvas.height + 3) + "px";
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


      ctx.fillStyle = "black";
      ctx.fillRect( 0, 0, grid.width, grid.height);
      ctx.closePath();

      ctx.font = "bold 12px Helvetica";

      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;
      ctx.fillStyle = "green";

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
        upper -= 60
        radarDist += 60;
      }

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
