var lastTurn;
var starter;

/*
jQuery stuff*/


$('#send').on('click', function(){
    console.log("click send");

    if (client_socket) {
        //console.log("submitting chat");
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
        move: [row,col],
        starter: starter
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

    //Server Disconnect
    if($('#start-stop-btn').text() === 'Stop'){
        $('#start-stop-btn').html('Start');
        e.preventDefault();
        server_io.emit('closing_server');
        server_io.close();
        socketlist = [];
        $('#chatbox-title').html('Chatbox');
        $('#chat-msgbox').empty();

    }//Client Disconnect    
    else if($('#start-stop-btn').text() === 'Disconnect'){
        $('#start-stop-btn').html('Connect');
        var msg={};
        msg.name = name;
        console.log("IM LEAVING= "+ msg);
        client_socket.emit('disconnect message', msg);

        e.preventDefault();
        client_socket.destroy();
        client_socket = undefined;
        $('#chatbox-title').html('Chatbox');
        $('#chat-msgbox').empty();
    }
});

$('button[name=restart]').on('click', function(e){
    console.log("restart pressed on "+role);
    if( role === 'server') {
        console.log("client_socket= "+client_socket);
        client_socket.emit('restart', '');
    } else {
        client_socket.emit('resetBoard','');
    }
});

$('#role').on('change', function(e){
    var role = $('#role').val();
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
};


