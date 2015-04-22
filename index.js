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
    //console.log(row +','+col);

    var data = {
        move: [row,col],
        starter: starter
    }

    $(this).addClass(role+'Move');
    data.lastTurn=lastTurn;
   // console.log('role now: '+role+' lastTurn: '+data.lastTurn);
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
        match_socket.emit('userdata', {isServer:false});
        socketlist = [];
        $('#chatbox-title').html('Chatbox');
        $('#chat-msgbox').empty();
        $('form#setupForm input').prop('disabled',false);
        reset_board();

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
        $('form#setupForm input').prop('disabled',false);
        reset_board();
    }
});

$('button[name=restart]').on('click', function(e){
    console.log("restart pressed on "+role);
    if( role === 'server') {
        client_socket.emit('restart', '');
    } else {
        client_socket.emit('resetBoard','');
    }
});

$('#role').on('change', function(e){
    var role = $('#role').val();
    if( role === "server"){
        $('form#setupForm button').html('Start');
        $('button[name=restart]').html('Restart Game');
    } else {
        $('form#setupForm button').html('Connect');
        $('button[name=restart]').html('Reset Board');
    }
});

//change theme
$('#change-theme-select').change(function(){
    console.log("try to change theme");
    if($('#change-theme-select option:selected').text() === 'bg3'){
        console.log("get in bg3");
        $('body').css('background', 'url(public/tri.svg)');
    }else if($('#change-theme-select option:selected').text() === 'bg1'){
        $('body').css('background', 'url(public/bg1.jpg)');
    }else if($('#change-theme-select option:selected').text() === 'bg2'){
        $('body').css('background', 'url(public/texture_cyantiles.jpg)');
    }else if($('#change-theme-select option:selected').text() === 'bg4'){
        $('body').css('background', 'url(public/bg4.jpg)');
    }else if($('#change-theme-select option:selected').text() === 'bg5'){
        $('body').css('background', 'url(public/texture_bluewood.jpg)');
    }
});

$('#chatbox-title').on('click', function(){
    $('#onlineuserlist-btn').removeClass('selected');
    $('#chatbox-title').addClass('selected');
    $('#chat-msgbox').removeClass('invisible');
    $('#onlineuserlist').addClass('invisible');
    
});
$('#onlineuserlist-btn').on('click', function(){
    $('#chatbox-title').removeClass('selected');
    $('#onlineuserlist-btn').addClass('selected');
    $('#chat-msgbox').addClass('invisible');
    $('#onlineuserlist').removeClass('invisible');
});


//Clear all XO in table
var reset_board = function(){
    $('.xo i').attr('class', '');
};


