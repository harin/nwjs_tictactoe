var role;
var ip;
var port;
var client_socket;
var match_socket;
var userList;
var matchServerIp = "localhost";



$('form#setupForm').submit(function(){


    name = $('#name').val();
    role = $('#role').val();
    ip = $('#ipAddress').val();
    port = $('#port').val();
    $('#playerName').html(name);
    $('#playerScore').html(0);


    createClientSocket(name,role,ip,port);
    //Show joining msg
    var msg={};
    msg.name = name;
    //console.log("IM CONNECTING= "+ msg);
    client_socket.emit('join message', msg);


    //sockets stuff
    client_socket.on('first turn', function(data){
        starter = data.first;
        lastTurn = data.second;
        //console.log("firstStarter= "+ starter);
        if(starter === 'server'){
            $('#serverBoard label').css("color","black");
            $('#clientBoard label').css("color","white");

        }else{
            $('#clientBoard label').css("color","black");
            $('#serverBoard label').css("color","white");
        }
        // alert(starter+ " plays first.");
    });


    client_socket.on('serverName', function(name){
        //console.log("got server name= "+name);
        //console.log("my role is "+ role);

        if (role === 'client'){
            //set opponent name
            $('#opponentName').html(name);
            $('#opponentScore').html(0); 
        }
    }); 
    client_socket.on('clientName', function(name){
        //console.log("got client name= "+name);
        //console.log("my role is "+role);
        if (role === 'server'){
            //set opponent name
            $('#opponentName').html(name);
            $('#opponentScore').html(0); 

        }
    });


    client_socket.on('resetBoard', function(data){
        lastTurn=data.lastTurn;
        starter=data.starter;

        if(starter === 'server'){
            $('#serverBoard label').css("color","black");
            $('#clientBoard label').css("color","white");

        }else{
            $('#clientBoard label').css("color","black");
            $('#serverBoard label').css("color","white");
        }

        reset_board();
        // alert(starter+" gets to starts");
    });

    client_socket.on('connect', function(){
        alert("Welcome to the Game!!");
    });


    client_socket.on('quake', function(){
        console.log("Me should shake");

        if (sentQuake === true){
            sentQuake = false;
        } else {
            quake()
        }
    });
    /******************************************************** 
                      Reactive Variables
     *********************************************************/


    client_socket.on('noConnections', function(noConnections){
        $('#chatbox-title').html('Chatbox ('+noConnections+')');
    });

    client_socket.on('serverScore', function(serverScore){
        //console.log("serverScore="+serverScore);
        $('#serverScore').html(serverScore);
    });

    client_socket.on('clientScore', function(clientScore){
        //console.log("clientScore="+clientScore);
        $('#clientScore').html(clientScore);
    });

    client_socket.on('serverName', function(serverName) {
        $('#serverScoreLabel').html(serverName);
    });

    client_socket.on('clientName', function(clientName) {
        $('#clientScoreLabel').html(clientName);
    });

    client_socket.on('ip', function(ipFromSv) {
        ip = ipFromSv
        console.log('Client: My IP is ' + ip);
        $('#ipAddress').val(ip);
    });

    /* Chat */
    client_socket.on('chat message', function(msg){
        console.log("message from server: "+ msg);
        $('#m').val("");
        $('#chat-msgbox').append("<li class='chat-msg'><span>"+msg.name+":</span> "+msg.text+"</li>");     
    });

    /* Update Board */
    client_socket.on('board update', function(data){
        console.log(data);
        var move = data.move;
        var mover = data.by;

        var selector = "#row"+move[0]+" #col"+move[1]+" i";
        //console.log("updating: " + selector +" by " + mover);

        if ( mover === starter ) {
            $(selector).addClass('fa fa-times fa-5x');
        } else {
            $(selector).addClass('fa fa-circle-o fa-5x');
        }
    });

    /* Gameover */
    client_socket.on('gameover', function(data){
        alert("Winner: "+data.winner + "! " + data.msg);
        // reset_board();
    });

    client_socket.on('error', function(msg){
        alert(msg);
    });

    /* Get Turn*/
    client_socket.on('lastTurn', function (e) {
        // console.log("Last turn =" + e);
        lastTurn = e;

        if(lastTurn !== 'server'){
            $('#serverBoard label').css("color","black");
            $('#clientBoard label').css("color","white");

        }else{
            $('#clientBoard label').css("color","black");
            $('#serverBoard label').css("color","white");


        }
    });

    /* Disconnect */
    client_socket.on('connect_error', function(e){
        console.log("Connect_error Event");
        disconnect();
    });

    client_socket.on('connect_timeout', function(e){
        console.log("Connect_timeout Event");
        disconnect();
    });

    client_socket.on('reconnect_failed', function(e){
        console.log("reconnect_failed Event");
        disconnect();
    });

    client_socket.on('reconnect_error', function(e){
        console.log("reconnect_error Event");
        disconnect();
    });

    client_socket.on('closing_server', function(){
        console.log("closing_server Event");
        $('#chat-msgbox').append("<li class='chat-msg'><span>Server Closed</span></li>");     
        disconnect();
    });





    return false;

});

var disconnect = function(){
    if(role === 'server'){
        $('#start-stop-btn').html('Start');
        client_socket.destroy();
        client_socket = undefined;
        $('#chatbox-title').html('Chatbox');
        $('#chat-msgbox').empty();
    }else{
        $('#start-stop-btn').html('Connect');
        client_socket.destroy();
        client_socket = undefined;
        $('#chatbox-title').html('Chatbox');
    }
}

var createClientSocket = function(n,r,i,p){
    if (r === "server"){
        //is server
        alert("I'm server: " +n) ;
        //if not running -> start listening
        $('#start-stop-btn').html('Stop');
        $('form#setupForm input').prop('disabled',true);

        http.listen( p, function(){
            console.log('listening on *:' + p);
        });

        client_socket = io('http://localhost:' + p);
        match_socket.emit('userdata',{
            name: name,
            ip: realip,
            port: p,
            isServer: true
        })
        console.log("Match socket = " + match_socket);
        client_socket.emit('serverName', n);

    } else {
        //is client
        alert("I'm client: " +n) ;
        $('#start-stop-btn').html('Disconnect');
        $('form#setupForm input').prop('disabled',true);
        if (!client_socket){
            //If doesn't exist, create a new one and connect
            client_socket = io('http://' + i + ':' + p);
            client_socket.emit('clientName', n);
        } 
    }
};

$(document).ready(function(){
    if (name) $('#name').val(name);

    var port = $('#port').val();
    // var query = 'ip='+realip+'&name='+name+'&port='+port+'&isServer=false';
    var query = 'name='+name+'&isServer=false';
    match_socket = io('http://'+matchServerIp+':8765' , {query: query});
    //Match socket

    match_socket.on('quake', function(){
        console.log("Me should shake");
        quake();
    });

    match_socket.on('userList', function(ul){
        console.log('Client: Updating User list');
        userList = ul;

        //clear user list ui
        $('#onlineuserlist').empty();
        userList.forEach(function(user, index){
            var toAppend = '<li data-index='+ index +'><span>'+user.name+'</span> | ' + user.ip+ ' | '+ user.port ;
            if( user.isServer === true) toAppend +='<button class="btn btn-warning selectRoom">Join</button>';
            toAppend += '</li>';
            // if( user.gameStarted === true) toAppend += '<button class="restartGame">Restart</button>';
            $('#onlineuserlist').append(toAppend);

            $('button.selectRoom').on('click', function(event){

                var li = $(event.target).closest('li');
                var index = li.data('index');
                console.log('index = ' + index);

                var user = userList[index];
                $('#ipAddress').val(user.ip);
                $('#port').val(user.port);
            });
        });
    });
});


