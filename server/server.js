var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var cors = require('cors');
var port = process.env.PORT || 5000;


var connect4 = {
  players: [],
  pairId: 0
  //pairs: []
}

var allPlayers = [];

//var players = {};
//var pairId = 1;
//var pairs = {};


app.use(express.static(__dirname + '/public'));
app.use(cors());


// Function to generate random number
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


io.on('connection', function (socket) {
  //send the id
  io.to(socket.id).emit('socketID',socket.id);


  socket.on('connect4',function (name) {
    console.log("CONNECT")
    var pairId = connect4.pairId;
    //Get new pair id if not odd
    if(connect4.players.length % 2 == 0) {
      //New pair id
      connect4.pairId++;
    }
    connect4.players.push({id:socket.id,name:name,pairId:connect4.pairId});
    //Record all players
    allPlayers.push({id:socket.id,game:'connect4'});
    var pair = connect4.players.filter(p => p.pairId == connect4.pairId);
    console.log(pair);
    if(pair.length > 1) {
      //Pair is found
      //socket.pairs.push({player1:pair[0],player2:pair[1]});
      io.to(pair[0].id).emit('pair',pair);
      io.to(pair[1].id).emit('pair',pair);
    }

    socket.on('connect4-turntaken',function(playerId,pairId,grid) {
      console.log("TURN");
      var otherPlayer = connect4.players.filter(p => p.pairId == pairId && p.id != playerId);

      //Send updated grid to other player
      io.to(otherPlayer[0].id).emit('yourturn',grid);
    });

    socket.on('connect4-winner',function(playerId,pairId) {
       var otherPlayer = connect4.players.filter(p => p.pairId == pairId && p.id != playerId);
       io.to(otherPlayer[0].id).emit('winner',playerId);
       io.to(playerId).emit('winner',playerId);
       //Destroy the pair
       var remaining = connect4.players.filter(p => p.pairId != pairId);
       connect4.players = remaining;
    });
  });


  /*
  socket.on('other_player_start', function (otherPlayer) {
    io.to(otherPlayer).emit('player_found',players[socket.id],true);
  });*/

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('DISCONNECT');
    var player = allPlayers.filter(p => p.id == socket.id);
    if(player.length > 0) {
      if(player[0].game === 'connect4') {
        var connect4Player = connect4.players.filter(p => p.id == socket.id);
        if(connect4Player.length > 0) {
          //Remove player
          var newConnect4Players = connect4.players.filter(np => np.id != socket.id);
          connect4.players = newConnect4Players;
          var newAllPlayers = allPlayers.filter(np => np.id != socket.id);
          allPlayers = newAllPlayers;
          //Find paired player if still exists and notify
          var otherPlayer = newConnect4Players.filter(op => op.pairId == connect4Player[0].pairId);
          if(otherPlayer.length > 0) {
              console.log("other",otherPlayer);
              io.to(otherPlayer[0].id).emit('otherdisconnected');
          }
        }
        console.log(connect4);
      }
    }
  });

});




server.listen(port, function(){
  console.log('listening on *:' + port);
});
