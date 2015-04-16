var role;
var ip;
var port;
var client_socket;
var opponentName;

/*$(document).ready(function(){
  console.log("Welcome Message!!");
    alert("Welcome!!");

  });*/


$('form#setupForm').submit(function(){
    name = $('#name').val();
    role = $('input[name=role]:checked', '#setupForm').val();
    ip = $('#ipAddress').val();
    port = $('#port').val();
    $('#playerName').html(name);
    $('#playerScore').html(0);


    /*  if (role === "server"){
        //is server
        alert("I'm server: " +name) ;
        //if not running -> start listening


        http.listen( port, function(){
            console.log('listening on *:' + port);
        });

        client_socket = io('http://localhost:' + port);
        client_socket.emit('serverName', name);

        // client_socket = io('http://localhost:3000');
    } else {
        //is client
        alert("I'm client: " +name) ;
        if (!client_socket){
            //If doesn't exist, create a new one and connect
            client_socket = io('http://' + ip + ':' + port);
        } 

        client_socket.emit('clientName', name);
    } */

    createClientSocket(name,role,ip,port);


    /*if(client_socket) {
        if( role === "server"){
            //Change Start button to Stop
            $('form#setupForm button').html('Stop');
        } else {
            //Change connect button to Disconnect
            $('form#setupForm button').html('Disconnect');
        }
    }*/


    //sockets stuff
    client_socket.on('serverName', function(name){
        console.log("got server name= "+name);
        console.log("my role is "+ role);
        opponentName = name;

        if (role === 'client'){
            //set opponent name
            $('#opponentName').html(name);
            $('#opponentScore').html(0); 

        }
    }); 

    client_socket.on('clientName', function(name){
        console.log("got client name= "+name);
        console.log("my role is "+role);
        opponentName = name;
        if (role === 'server'){
            //set opponent name
            $('#opponentName').html(name);
            $('#opponentScore').html(0); 

        }
    });

    client_socket.on('resetBoard', function(data){
        reset_board();
    });

    client_socket.on('connect', function(){
        alert("Welcome to the Game!!");
    });


    /******************************************************** 
                      Reactive Variables
     *********************************************************/


    client_socket.on('noConnections', function(noConnections){
        $('#chatbox-title').html('Chatbox ('+noConnections+')');
    });

    client_socket.on('serverScore', function(serverScore){
        console.log("serverScore="+serverScore);
        $('#serverScore').html(serverScore);
    });

    client_socket.on('clientScore', function(clientScore){
        console.log("clientScore="+clientScore);
        $('#clientScore').html(clientScore);
    });

    client_socket.on('serverName', function(serverName) {
        $('#serverScoreLabel').html(serverName);
    });

    client_socket.on('clientName', function(clientName) {
        $('#clientScoreLabel').html(clientName);
    });


    /* Chat */
    // console.log("client socket = " + client_socket);

    client_socket.on('chat message', function(msg){
        console.log("message from server: "+ msg);
        //$('#chat-msgbox').append("<li>"+msg+"</li>");     

        // if(role==="client"){
        $('#chat-msgbox').append("<li>"+msg.name+": "+msg.text+"</li>");     
        // }else{
        //     $('#chat-msgbox').append("<li>"+name+": "+msg+"</li>");     
        // }

    }); 


    /* Update Board */
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


    /* Gameover */
    client_socket.on('gameover', function(data){
        alert(data.winner + " won!\n" + data.msg);
        reset_board();
    });

    client_socket.on('error', function(msg){
        alert(msg);
    });


    /* Get Turn*/
    client_socket.on('lastTurn', function (e) {
        console.log("Last turn =" + e);
        lastTurn = e;
    });
    return false;
});

var createClientSocket = function(n,r,i,p){
    if (r === "server"){
        //is server
        alert("I'm server: " +n) ;
        //if not running -> start listening


        http.listen( p, function(){
            console.log('listening on *:' + p);
        });

        client_socket = io('http://localhost:' + p);
        client_socket.emit('serverName', n);

        // client_socket = io('http://localhost:3000');
    } else {
        //is client
        alert("I'm client: " +n) ;
        if (!client_socket){
            //If doesn't exist, create a new one and connect
            client_socket = io('http://' + i + ':' + p);
        } 

        client_socket.emit('clientName', n);
    }
};