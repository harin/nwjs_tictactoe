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
var noConnections = 0;

/**************************************************** 
                     Methods
*****************************************************/


server_io.on('connection', function(socket){
    console.log('a user connected');
    alert("Welcome to the game!");
    server_io.emit('serverName', serverName);
    server_io.emit('noConnections', ++noConnections);

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
        console.log('message: ' + msg);
        server_io.emit('chat message', msg);
    });

    socket.on('server move', function(data){
        var move = data.move;
        console.log('server move : '+move);
        var shouldUpdate = updateBoard(move,1,board);
        console.log('should update =' + shouldUpdate);
        if( shouldUpdate){
            console.log('send board update');
            var updateData = {
                move: move,
                by: 'server'
            }
            server_io.emit('board update', updateData);
        }

    });

    socket.on('client move', function(data){
        var move = data.move;
        console.log('client move : ' + move);
        if( updateBoard(move, -1, board)){
            var updateData = {
                move: move,
                by: 'client'
            }
            server_io.emit('board update', updateData);
        }
    });

    socket.on('restart', function(){
        restart();
    });

});


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
    board = [[ 0 , 0 , 0 ],
             [ 0 , 0 , 0 ],
             [ 0 , 0 , 0 ]]
}

var isComplete = function(value, max){
    if ( value == max ) {
        server_io.emit('gameover', { winner: "server" });
        restart();
        return true;
    } else if ( value == -max ) {
        server_io.emit('gameover', { winner: "client" });
        restart();
        return true;
    }
    return false;
}

