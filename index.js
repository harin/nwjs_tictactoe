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
        alert("can't Move now");
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
        server_io.close();
        client_socket.destroy();
        client_socket = undefined;
        $('#chatbox-title').html('Chatbox');
        //server_io = undefined;
    }else if($('#start-stop-btn').text() === 'Disconnect'){
        e.preventDefault();
        $('#start-stop-btn').html('Connect');
        client_socket.destroy();
        client_socket = undefined;
        $('#chatbox-title').html('Chatbox');
    }else if($('#start-stop-btn').text() === 'Start'){
        $('#start-stop-btn').html('Stop');
        //server_io = require('socket.io')(http);
    }else if($('#start-stop-btn').text() === 'Connect'){
        $('#start-stop-btn').html('Disconnect');
    };
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
    data.lastTurn = "";
};