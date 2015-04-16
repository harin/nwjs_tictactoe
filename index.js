    var lastTurn;

/*
jQuery stuff*/


$('#send').on('click', function(){
    console.log("click send");

    if (client_socket) {
        console.log("submitting chat");
        var msg={};
        msg.name = name;
        msg.text = $('#m').val();
        console.log("my msg= "+ msg);
       // $('#chat-msgbox').append("<li>me: "+msg+"</li>");
       client_socket.emit('chat message', msg);

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
    data.lastTurn=lastTurn;
    console.log('role now: '+role+' lastTurn: '+data.lastTurn);
    if (role === data.lastTurn)
    {
        alert("waiting for other player to move");
    }
    else
    {
        //  client_socket.emit( role +' move', data );
        // // data.lastTurn = role;
        // $(this).addClass(role + 'Move');
        client_socket.emit(role + ' move', data);
    }
});

$('#start-stop-btn').on('click', function(e){
    if($('#start-stop-btn').text() === 'Stop'){
        e.preventDefault();
        $('#start-stop-btn').html('Start');
        if (role === 'server'){
            console.log("trying to close connection");
            http.close(function(){
                console.log("Stopped listening");
            });
        }
    }
});

$('button[name=restart]').on('click', function(e){
    console.log("restart pressed on "+role);
    if( role === 'server') {
        console.log("client_socket="+client_socket);
        client_socket.emit('restart', '');
    } else {
        client_socket.emit('resetBoard','');
    }
});

$('form#setupForm input[type=radio]').on('click', function(e){
    var role = $('input[name=role]:checked', '#setupForm').val();
    if( role === "server"){
        $('form#setupForm button').html('Start');
        $('button[name=restart]').html('Restart');
    } else {
        $('form#setupForm button').html('Connect');
        $('button[name=restart]').html('Reset Board');
    }
});

var reset_board = function(){
    $('.xo i').attr('class', '');
    // data.lastTurn = "";
    var randomVal = Math.random()*10;
    if(randomVal<5){
        lastTurn='server';
    }
    else{
        lastTurn='client';
    }
    console.log("not start= "+ lastTurn);
    alert(lastTurn+"player will not start");
};


