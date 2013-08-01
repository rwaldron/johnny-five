/* global io */
$(document).ready(function() {
  var $body = $("body");
  var socket = window.socket;

  socket = io.connect("http://192.168.1.186:8080");

  socket.on("createServo", function( data ) {
    var div, span, input;

    div = $("<div>");
    // should probably just make this a <label>
    span = $("<span>", {
      html: data.servo
    }).addClass("label");
    input = $("<input/>", {
      min: data.min,
      max: data.max,
      type: "range"
    });

    input.on("change", function() {
      socket.emit("range", {
        id: data.id,
        value: $(this).val()
      });
    });

    div.append(span, input);
    $body.append( div );
  });
});
