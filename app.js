"use strict";

var app = require('express')();
var http = require('http').Server(app);
var server_io = require('socket.io')(http);
var firstTurn = {};

$(document).ready(function(){
    alert("Welcome!!");
    var randomVal = Math.random()*10;

    if(randomVal < 5){
        firstTurn.first = 'client';
        firstTurn.second = 'server';
    }
    else{
        firstTurn.first= 'server';
        firstTurn.second= 'client'
    }
    console.log("first round= "+firstTurn);
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

/**************************************************** 
                     Properties
*****************************************************/


var board = [[ 0 , 0 , 0 ],
             [ 0 , 0 , 0 ],
             [ 0 , 0 , 0 ]]

var serverName = "";
var clientName = "";
// var lastTurn;
var noConnections = 0;
var serverScore = 0;
var clientScore = 0;
var winner = "";

/**************************************************** 
                     Methods
*****************************************************/


server_io.on('connection', function(socket){
    console.log('a user connected');
    server_io.emit('serverName', serverName);

    //Initialize numeric values in client
    server_io.emit('noConnections', ++noConnections);
    server_io.emit('serverScore', serverScore);
    server_io.emit('clientScore', clientScore);

    server_io.emit('first turn', firstTurn);

    // resetBoard();
    // if(noConnections == 2) {
    //ready to start game
    // var starter = Math.round(Math.random());
    //   if (starter === 1 ){
    //     // let server start
    //     server_io.emit('lastTurn', 'server');
    //   } else {
    //     // let client start
    //     server_io.emit('lastTurn', 'client');
    //   }
    // } else {
    //   server_io.emit('lastTurn', 'unknown');
    // }

    socket.on('disconnect', function(){
        console.log('user disconnected');
        server_io.emit('noConnections', --noConnections);
    });

    socket.on('serverName', function(data){
        console.log('serverName='+data);
        serverName = data;
        server_io.emit('serverName', data);
    });

    socket.on('clientName', function(data){
        console.log('clientName='+data);
        clientName = data
        server_io.emit('clientName', data);
    });

    socket.on('chat message', function(msg){
        console.log('message from client: ' + msg);
        server_io.emit('chat message', msg);
    });

    socket.on('disconnect message', function(msg){
        console.log("LEAVER!!!");
        $('#chat-msgbox').append("<li class='chat-msg'><span>"+msg.name+" has left the game</span></li>");            
    });

    socket.on('connect message', function(msg){
        $('#chat-msgbox').append("<li class='chat-msg'><span>"+msg.name+" has joined to the game</span></li>");
    });

    socket.on('server move', function(data){
        var move = data.move;
        console.log('server move : '+move);
        console.log('first round: '+data.lastTurn);
        if(data.lastTurn === 'server'){
            alert("can't Move");
            console.log('why kao this one');
        } 
        else{
            var shouldUpdate = updateBoard(move,1,board);
            console.log('should update =' + shouldUpdate);

            console.log('send board update');
            var updateData = {
                move: move,
                by: 'server'
            }
            data.lastTurn = 'server';
            console.log('server move CAN MOVE');
            server_io.emit('board update', updateData);
            server_io.emit('lastTurn', 'server');

            if( !shouldUpdate ) {
                gameOverMsg();
                resetBoard();
            }
        }
    });

    socket.on('client move', function(data){
        var move = data.move;
        console.log('client move : ' + move);
        console.log('last turn clientmove: '+data.lastTurn);
        if(data.lastTurn!=='client'){
            var shouldUpdate = updateBoard(move, -1, board)
            var updateData = {
                move: move,
                by: 'client'
            }
            server_io.emit('board update', updateData);
            data.lastTurn = 'client';
            server_io.emit('lastTurn', 'client');
            console.log('last turn line 128 client');

            if( !shouldUpdate ) {
                gameOverMsg();
                resetBoard();
            }

        }
    });

    socket.on('restart', function(data){
        console.log('received restart request');
        // console.log(data.starter+' will get to start');
        restart();
    });

    socket.on('resetBoard', function(data){
        resetBoard();
    });

    // socket.on('restart', function(){
    //     restart();
    // });

});
var socketlist = [];
server_io.sockets.on('connection', function(client_socket) {
    socketlist.push(client_socket);
    client_socket.emit('socket_is_connected','You are connected!');
    client_socket.on('close', function () {
        console.log('socket closed');
        socketlist.splice(socketlist.indexOf(client_socket), 1);
    });
});


// input:
//      pos = the position of the move to be updated
//      value = the value to be put into the board (1 = server, -1 = client)
//      board = the reference to the board to be updated
// output = boolean / wether the board still needs to be updated
var updateBoard = function(pos, value, board){
    var sum;
    var ret = true;
    var x = pos[0];
    var y = pos[1];
    if ( board[x][y] === 0 ){
        board[x][y] = value;
    } else {
        server_io.emit('error', "That slot is taken!");
    }
    //Check if winner

    //Check all row
    board.forEach(function(row, index, array){
        sum = 0;
        row.forEach(function(slot, index, row){
            sum += slot;
        });

        if( isComplete(sum, row.length) ) {
            ret = false;
        }
    });

    //Check all column
    for( var col = 0; col< board.length; col++){
        sum = 0;
        for( var row = 0; row< board[col].length; row++){
            sum += board[row][col];
        }
        if( isComplete(sum, board.length)) {
            ret = false;
        }
    }
    //Check diagonals
    sum = 0;
    for( var i= 0; i < board.length; i++) {
        sum += board[i][i];
    }
    if( isComplete(sum, board.length)){
        ret = false; 
    }

    sum = 0;
    for( var i= 0; i < board.length; i++) {
        sum += board[i][board.length - 1 - i]
    }
    if( isComplete(sum, board.length)){
        ret = false;
    }

    //check board full
    sum = 0;
    for(var i=0; i<board.length; i++){
        for(var j=0; j<board.length;j++){
            if(board[i][j]===-1 || board[i][j]===1){
                console.log('board '+i+','+j+   'has value');
                sum++;
                console.log('sum: '+sum);
            }
        }
    }
    var boardsize =board.length*board.length;
    console.log('board size: '+boardsize +' sum: '+sum);
    if( isTie(sum, boardsize)){
        console.log('board full');
        ret = false;
    }

    //if no winner update board
    return ret;
}

var restart = function(){
    resetBoard();
    serverScore = 0;
    clientScore = 0;
    server_io.emit('serverScore', serverScore);
    server_io.emit('clientScore', clientScore);
}

var resetBoard = function(){
    board = [[ 0 , 0 , 0 ],
             [ 0 , 0 , 0 ],
             [ 0 , 0 , 0 ]];
    var randomVal = Math.random()*10;
    console.log("random: "+randomVal);
    var data={};
    if(randomVal<5){
        data.lastTurn='server';
        data.starter = 'client';
    }
    else{
        data.lastTurn='client';
        data.starter= 'server';
    }
    server_io.emit('resetBoard', data);
}

var gameOverMsg = function(){
    server_io.emit('gameover', 
                   { 
        winner: winner,
        msg: "" + serverName +" : " + serverScore + " | " +clientName +" : " + clientScore
    }
                  );
}

var isComplete = function(value, max){
    if ( value == max ) {
        server_io.emit('serverScore', ++serverScore);
        winner = serverName;
        // server_io.emit('gameover', 
        //     { 
        //         winner: serverName,
        //         msg: "" + serverName +" : " + serverScore + " | " +clientName +" : " + clientScore
        //     }
        // );
        console.log("server score=" + serverScore);
        // resetBoard();
        return true;
    } else if ( value == -max ) {
        server_io.emit('clientScore', ++clientScore);
        winner = clientName;
        // server_io.emit('gameover', 
        //     {
        //         winner: clientName,
        //         msg: "" + serverName +" : " + serverScore + " | " +clientName + " : " + clientScore
        //     }
        // );
        console.log("client score=" + clientScore);

        // resetBoard();
        return true;
    }
    return false;
}

var isTie = function(value, max){
    if ( value == max ) {
        server_io.emit('serverScore', serverScore);
        winner = "Tied";
        // server_io.emit('gameover', 
        //     { 
        //         winner: "Tied",
        //         msg: "" + serverName +" : " + serverScore + " | " +clientName +" : " + clientScore
        //     }
        // );
        console.log("server score=" + serverScore);
        resetBoard();
        return true;
    }
    return false;
}

