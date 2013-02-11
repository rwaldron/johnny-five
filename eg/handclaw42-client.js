(function( exports, io ) {

  var socket, strobe;

  socket = io.connect("http://localhost");

  socket.on( "reset", function() {
    console.log("RESET");

    radars.length = 0;
  });


}( this, this.io ) );


$(document).ready(function() {
  $('body').on("touchmove", ':not([type="range"])', function() {
    this.preventDefault();
}, false);

  socket = io.connect("http://192.168.1.12:8080");

  socket.on('createServo', function(data){
    var $body = $('body');
    servo = $('<input/>');
    servo.attr('type', 'range');
    servo.addClass('servo');
    servo.data('servo', data.servo);
    servo.attr('min', data.min);
    servo.attr('max', data.max);
    servo.css('width', 400);
    servo.change(function() {
      console.log($(this).val());
      console.log($(this).data('servo'));
      socket.emit('range', {servo: $(this).data('servo'), value: $(this).val()});
    });
    $body.append(servo);
    $body.append('<br />');
  });

});