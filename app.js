"use strict";

var app = require('express')();
var http = require('http').Server(app);
var server_io = require('socket.io')(http);


$(document).ready(function(){
    console.log("Welcome Message!!");
    alert("Welcome!!");
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

/**************************************************** 
                     Methods
*****************************************************/


server_io.on('connection', function(socket){
    console.log('a user connected');
    alert("Welcome to the game!");
    server_io.emit('serverName', serverName);

    //Initialize numeric values in client
    server_io.emit('noConnections', ++noConnections);
    server_io.emit('serverScore', serverScore);
    server_io.emit('clientScore', clientScore);
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

    socket.on('server move', function(data){
        var move = data.move;
        console.log('server move : '+move);
        console.log('first round: '+data.lastTurn);
        if(data.lastTurn === 'server'){
            alert("can't Move");
            console.log('why kao this one');
        }
        // else if(data.lastTurn === undefined){

        // }   
        else{
            var shouldUpdate = updateBoard(move,1,board);
            console.log('should update =' + shouldUpdate);
            if( shouldUpdate){
                console.log('send board update');
                var updateData = {
                    move: move,
                    by: 'server'
                }
                data.lastTurn = 'server';
                console.log('server move CAN MOVE');
                server_io.emit('board update', updateData);
                server_io.emit('lastTurn', 'server');
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

    socket.on('client move', function(data){
        var move = data.move;
        console.log('client move : ' + move);
        console.log('last turn clientmove: '+data.lastTurn);
        if(data.lastTurn!=='client'){
            if( updateBoard(move, -1, board)){
                var updateData = {
                    move: move,
                    by: 'client'
                }
                server_io.emit('board update', updateData);
                data.lastTurn = 'client';
                server_io.emit('lastTurn', 'client');
                console.log('last turn line 128 client');
            }
        }
    });

    // socket.on('restart', function(){
    //     restart();
    // });

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
    if( isComplete(sum, board.length)) ret = false

    sum = 0;
    for( var i= 0; i < board.length; i++) {
        sum += board[i][board.length - 1 - i]
    }
    if( isComplete(sum, board.length)) ret = false


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

var isComplete = function(value, max){
    if ( value == max ) {
        server_io.emit('serverScore', ++serverScore);
        server_io.emit('gameover', 
            { 
                winner: serverName,
                msg: "" + serverName +" : " + serverScore + " | " +clientName +" : " + clientScore
            }
        );
        console.log("server score=" + serverScore);
        resetBoard();
        return true;
    } else if ( value == -max ) {
        server_io.emit('clientScore', ++clientScore);
                server_io.emit('gameover', 
            { 
                winner: clientName,
                msg: "" + serverName +" : " + serverScore + " | " +clientName + " : " + clientScore
            }
        );
        console.log("client score=" + clientScore);

        resetBoard();
        return true;
    }
    return false;
}

