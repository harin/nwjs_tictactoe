var role;
var ip;
var port;
var client_socket;
$('form#setupForm').submit(function(){
role = $('input[name=role]:checked', '#setupForm').val();
ip = $('#ipAddress').val();
port = $('#port').val();

if (role === "server"){
  //is server

  //if not running -> start listening
  http.listen( port, function(){
    console.log('listening on *:' + port);
  });

  client_socket = io('http://localhost:' + port);
  // client_socket = io('http://localhost:3000');
} else {
  //is client
  console.log("I'm the client");
  if (!client_socket){
    //If doesn't exist, create a new one and connect
    client_socket = io('http://' + ip + ':' + port );
  } else {
    if ( client_socket.disconnected ) {
      // If not connected, connect
      client_socket.connect('http://localhost:' +port, {forceNew: true});
    } else {
      // If connected, disconnect
      client_socket.disconnect();
    }
  }
}

if(client_socket) {
  //Change connect button to Disconnect
  if( role === "server"){
    $('form#setupForm button').html('Stop');
  } else {
    $('form#setupForm button').html('Disconnect');
  }
}

/*
  Chat
*/

console.log("client socket = " + client_socket);
client_socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
}); 

/*
  Update Board
*/
client_socket.on('board update', function(data){
  console.log(data);
  var move = data.move;
  var mover = data.by;

  var selector = "#row"+move[0]+" #col"+move[1]+" i";
  console.log("updating: " + selector +" by " + mover);

  if ( mover === "server" ) {
    $(selector).addClass('fa fa-times fa-5x');
  } else {
    $(selector).addClass('fa fa-circle-o fa-5x');
  }

});
/*
  Gameover
*/
client_socket.on('gameover', function(data){
  alert(data.winner + " won!");
  reset_board();
});

client_socket.on('error', function(msg){
  alert(msg);
});

return false;
});

/*

jQuery stuff

*/

$('form#chat').submit(function(){
if (client_socket) {
  console.log("submitting chat");
  client_socket.emit('chat message', $('#m').val());
  $('#m').val('');
}
    return false;
});

$('.xo').on('click', function(e){
var row = $(this).parent().data('row');
var col = $(this).data('col');
console.log(row +','+col);

var data = {
  move: [row,col]
}
$(this).addClass(role+'Move');
client_socket.emit( role +' move', data );
})

$('button[name=restart]').on('click', function(e){
reset_board();
client_socket.emit('restart', '');
});

$('form#setupForm input[type=radio]').on('click', function(e){
var role = $('input[name=role]:checked', '#setupForm').val();
if( role === "server"){
  $('form#setupForm button').html('Start');
} else {
  $('form#setupForm button').html('Connect');
}
});

var reset_board = function(){
$('.xo i').attr('class', '');
}