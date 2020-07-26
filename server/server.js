var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var cors = require('cors');
var port = process.env.PORT || 5000;


var connect4 = {
  players: [],
  pairId: 0,
  pairs: []
}

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
    var pair = connect4.players.filter(p => p.pairId == connect4.pairId);
    console.log(pair);
    if(pair.length > 1) {
      //Pair is found
      //socket.pairs.push({player1:pair[0],player2:pair[1]});
      io.to(pair[0].id).emit('pair',pair);
      io.to(pair[1].id).emit('pair',pair);
    }

    socket.on('turntaken',function(playerId,pairId,grid) {
      console.log("TURN");
      console.log(grid);
      var otherPlayer = connect4.players.filter(p => p.pairId == pairId && p.id != playerId);

      //Send updated grid to other player
      console.log(otherPlayer[0].id);
      io.to(otherPlayer[0].id).emit('yourturn',grid);
    });

    socket.on('winner',function(playerId,pairId) {
       var otherPlayer = connect4.players.filter(p => p.pairId == pairId && p.id != playerId);
       io.to(otherPlayer[0].id).emit('winner',playerId);
       io.to(playerId).emit('winner',playerId);
       console.log("WINNER",playerId,otherPlayer[0].id)
       //Destroy the pair
       var remaining = connect4.players.filter(p => p.pairId != pairId);
       connect4.players = remaining;
    });
  });



  socket.on('other_player_start', function (otherPlayer) {
    io.to(otherPlayer).emit('player_found',players[socket.id],true);
  });

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    /*
    if(players[socket.id].pairId > 0) {
      if(players[socket.id].pairId in pairs) {
        var pair = pairs[players[socket.id].pairId];
        if(pair.length > 1) {
          if(pair[0].id == socket.id) {
            var otherId = pair[1].id;
          } else {
            var otherId = pair[0].id;
          }
        }
        io.to(otherId).emit('finished_game',players[socket.id],true);
        delete pairs[players[socket.id].pairId];
      }
      delete players[socket.id];
    } else {
      delete players[socket.id];
    }*/
  });

  socket.on('draw_card', function (id) {
    //Randomly select the card and signal when ready
    var cardNo = randomNumber(1,6);
    players[id].cards.push(cardNo);
    io.to(id).emit('card_drawn');
  });

  socket.on('card_drawn',function(cardId,otherId) {
    players[otherId].cards.push(cardId);
    io.to(otherId).emit('card_drawn');
  });

  socket.on('guess_made', function (guess) {
    var cardId = players[socket.id].cards[players[socket.id].cards.length-1];
    //Randomly select the card and signal when ready
    if(guess == cardId) {
      result = true;
    } else {
      result = false;
    }
    players[socket.id].results.push(result);
    io.to(socket.id).emit('guess_result',cardId);
  });

  socket.on('player_has_guessed', function (otherId) {
    var guessResult = players[socket.id].results[players[socket.id].results.length-1];;
    io.to(otherId).emit('draw_again',guessResult);
  });

  socket.on('turn_change', function (otherId) {
    io.to(otherId).emit('turn_change');
  });

  socket.on('multiplayer_finished', function (otherId,playerInitiated) {
    if(players[otherId].pairId in pairs) {
      delete pairs[players[otherId].pairId];
    }
    io.to(socket.id).emit('finished_game',players[otherId],playerInitiated);
    io.to(otherId).emit('finished_game',players[socket.id],playerInitiated);
  });
});




server.listen(port, function(){
  console.log('listening on *:' + port);
});
