import React, { Component } from "react";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import NumericInput from 'react-numeric-input';
import WaitCircle from './waitcircle.js';
import Slot from './slot';
import { animateScroll } from "react-scroll";
import socketIOClient from "socket.io-client";

/*
import circle from '../assets/circle.svg';
import square from '../assets/square.svg';
import waves from '../assets/waves.svg';
import cross from '../assets/cross.svg';
import star from '../assets/star.svg';
import back from '../assets/back.svg';
import tick from '../assets/check-circle-regular.svg';
import mistake from '../assets/times-circle-regular.svg';
import exit from '../assets/door-open-solid-wh.svg';
import placeholder from '../assets/placeholder.svg';
*/

//const ENDPOINT = "https://zener-card-server.herokuapp.com/";

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

class UIPanel extends Component {

  constructor(props) {
    super(props);
    if(this.props.multiPlayer) {
      var turns = 2;
    } else {
      var turns = 1;
    }

    //Create array for grid
    var grid = [];
    for(var i=1;i<7;i++) {
      var cols = [];
      for(var j=1;j<7;j++) {
        cols[j] = {'idx':i*10+j,'slot':'empty'};
      }
      grid.push(cols);
    }

    this.state = {
      name: "",
      isStart: true,
      cardsDisabled: true,
      isFinished: false,
      numberOfCards: 25,
      drawCount: 0,
      connected: false,
      cardDrawn: false,
      guessMade: false,
      drawReady: true,
      otherPlayerFound: false,
      playerPickedCard: false,
      playerPick: false,
      cardMessage: "Click draw card to select the first card from the server",
      turns: turns,
      otherPlayerVerdict:null,
      results: [],
      grid: grid,
      playerTurn: true,
      rows: [0,1,2,3,4,5],
      //Related to messagebox
      gridWidth:0,
      gridHeight:0,
      displayMessage:'none',
      messageWidth:1,
      messageHeight:1
    }
    this.clickCard = this.clickCard.bind(this);
    this.drawCard = this.drawCard.bind(this);
    this.handleChangeCardCount = this.handleChangeCardCount.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.goToHome = this.goToHome.bind(this);
    this.initGame = this.initGame.bind(this);
    this.finish = this.finish.bind(this);
    this.getCardName = this.getCardName.bind(this);
    this.getVerdict = this.getVerdict.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.hoverSlot = this.hoverSlot.bind(this);
    this.leaveSlot = this.leaveSlot.bind(this);
    this.clickSlot = this.clickSlot.bind(this);
  }


  getCardName(id) {
    return null;
  }

  componentDidMount(){
    var gridHeight = document.getElementById('content').clientHeight;
    var gridWidth = document.getElementById('content').clientWidth;
    var messageHeight = document.getElementById('message-panel').clientHeight;
    var messageWidth = document.getElementById('message-panel').clientWidth;
    this.setState({gridWidth:gridWidth,gridHeight:gridHeight,messageHeight:messageHeight,messageWidth:messageWidth});
  }

  componentDidUpdate(prevProps,prevState){
    alert("Updated");
    console.log("component did update");
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    animateScroll.scrollToBottom({
      containerId: "resultpanel"
    });
  }

  initGame() {
    /*
    var component = this;
    this.socket = socketIOClient.connect(ENDPOINT);

    this.socket.on('socketID', function() {
      this.emit('new_player',component.state.name,component.props.multiPlayer);
      if(!component.props.multiPlayer) {
        component.setState({connected:true});
      }
    });

    this.socket.on('player_found', function(otherPlayer,drawReady) {
      component.setState({playerPick:drawReady, connected:true, otherPlayer:otherPlayer,otherPlayerFound:true});
      if(component.state.playerPick) {
        var cardMessage = "Choose a card, try and transmit that image to " + component.state.otherPlayer.name;
        var cardsDisabled = false;
      } else {
        var cardMessage = "Please wait for " + component.state.otherPlayer.name + " to select a card";
        var cardsDisabled = true;
      }
      component.setState({cardMessage:cardMessage, cardsDisabled:cardsDisabled});
      if(!drawReady) {
        //Signal to the server to start the other player
        this.emit('other_player_start',otherPlayer.id);
      }
    });

    this.socket.on('card_drawn', function() {
    });

    this.socket.on('guess_result', function(cardNo) {
    });

    this.socket.on('draw_again', function(result) {
      //Allow the player to draw another card
      if(result) {
        var cardMessage = component.state.otherPlayer.name + " guessed Correctly! Please pick another card";
      } else {
        var cardMessage = component.state.otherPlayer.name + " guessed Incorrectly! Please pick another card";
      }
      component.setState({playerPickedCard:false, cardsDisabled:false, cardMessage:cardMessage, cardDrawn:false});
    });

    this.socket.on('turn_change', function() {
    });
    */
  }



  clickCard(e) {
  }

  drawCard(e) {
  }

  handleChangeCardCount(e) {
  }

  handleChangeName(e) {
    this.setState({name:e.target.value});
  }

  handleStart() {
    this.setState({isStart:false,displayMessage:'inline-block'});
    this.initGame();
  }

  finish() {
    if(this.props.multiPlayer) {
      //Rules for other player dropping out - decided to kick both off and show message
      this.socket.emit('multiplayer_finished',this.state.otherPlayer.id,true);
      this.setState({iDisconnected:true});
    } else {
      this.socket.disconnect();
      var verdict = this.getVerdict(this.state.results.filter(r => r.result).length, this.state.results.length,true);
      this.setState({isFinished:true,verdict:verdict});
    }
  }

  goToHome() {
    this.props.history.push('/')
  }

  getVerdict(totalCorrect,total,isMe) {
  }


  hoverSlot(e) {
  }

  leaveSlot(e) {

  }

  flipGrid(grid) {
    var newGrid = [];

    for(var i=1;i<7;i++) {
      var newRow = [];
      newRow.push(0);
      for(var j=0;j<6;j++) {
        var row = grid[j];
        newRow.push(row[i]);
      }
      newGrid.push(newRow);
    }
    return newGrid;
  }

  transformDiag(grid) {
    var newGrid = [];

    for(var i=6;i>0;i--) {
      var newRow = [];
      newRow.push(0);
      var y = 1;
      for(var j=i;j>0;j--) {
        var x = j-1;
        var row = grid[x];
        newRow.push(row[y]);
        y++;
      }
      newGrid.push(newRow);
    }

    for(var i=6;i>0;i--) {
      var newRow = [];
      newRow.push(0);
      var y = 5;
      for(var j=7-i;j<7;j++) {
        var row = grid[y];
        newRow.push(row[j]);
        y--;
      }
      newGrid.push(newRow);
    }

    return newGrid;
  }


  transformDiagTopBottom(grid) {
    var newGrid = [];

    for(var i=5;i>-1;i--) {
      var newRow = [];
      newRow.push(0);
      var y = 6;
      for(var j=i;j>-1;j--) {
        //var x = j+1;
        var row = grid[j];
        newRow.push(row[y]);
        y--;
      }
      newGrid.push(newRow);
    }

    for(var i=5;i>-1;i--) {
      var newRow = [];
      newRow.push(0);
      var y = 5;
      for(var j=i;j>-1;j--) {
        //var x = j+1;
        var row = grid[y];
        newRow.push(row[j+1]);
        y--;
      }
      newGrid.push(newRow);
    }

    return newGrid;
  }


  check4() {
    var grid = this.state.grid;
    //console.log("grid",grid);
    var flipped = this.flipGrid(grid);
    //console.log("flipped",flipped);
    var diagTransformed = this.transformDiag(grid);
    //console.log("transformed",diagTransformed)
    var diagTransformedTopBottom = this.transformDiagTopBottom(grid);
    //console.log("transformed",diagTransformedTopBottom);
    if(this.checkCols(grid,"col")) {
      this.setState({isFinished:true});
    } else if(this.checkCols(flipped,"row")) {
      this.setState({isFinished:true});
    } else if(this.checkCols(diagTransformed,"diag")) {
      this.setState({isFinished:true});
    } else if(this.checkCols(diagTransformedTopBottom,"diag")) {
      this.setState({isFinished:true});
    }
    //Check rows
    //var count4 = 1;
    //var prev="empty";
  }

 checkCols(grid,ch) {
   var four = false;
   var winner = null;

   for(var i=0;i<grid.length;i++) {
     var col = grid[i];
     var count4 = 1;
     var prev="empty";
     for(var j=1;j<col.length;j++) {
       if(col[j].slot != "empty") {
         if(col[j].slot === prev) {
           count4++;
         } else {
           count4 = 1;
         }
         prev=col[j].slot;
       } else  {
         //console.log("e");
         prev=col[j].slot;
         //Reset counter
         count4 = 1;
       }
       //console.log("slot", count4, col[j].idx);
       if(count4 == 4) {
         four=true;
         if(!winner) {
           //As soon as four is reached there is a winner the game is over
           winner = prev;
         }
       }
     }
   }
   return winner;
 }


  checkFull() {
    var grid = this.state.grid;
    var rows = this.state.rows;
    for(var i=0;i<grid.length;i++) {
      var empties = grid[i].filter(row => row.slot === "empty");
      //console.log(empties);
      if(empties.length == 0) {
        //alert("full");
        rows = rows.filter(r => r!=i);
      }
    }
    console.log(rows);
    this.setState({rows:rows});
    //Check empty
    if(rows.length == 0) {
      return true;
    } else {
      return false;
    }
    /*
    if(rows.filter(g => g==0).length == 0) {
      return true;
    } else {
      return false;
    }*/
  }

  clickSlot(e) {
    var grid = this.state.grid;
    var playerTurn = this.state.playerTurn;
    var row = Math.floor(e.target.id / 10);
    //var col = e.target.id % 10;
    var grrow = grid[row-1];

    var firstSlot = grrow[1].slot

    if(playerTurn && firstSlot ==="empty") {
      for(var i=1;i<7;i++) {
        playerTurn = false;
        var grcol = grrow[i];
        if(grcol.slot === "empty") {
          //clear previous
          if(i>1) {
            grrow[i-1].slot = "empty";
          }
          if(grcol.slot === "empty") {
            grcol.slot = "red";
          }
          this.setState({grid:grid});
        }
      }
      this.check4();
    } else {
      playerTurn=true;
    }
    if(this.checkFull()) {
      this.setState({isFinished:true});
    } else {
      if(!this.props.multiPlayer && !playerTurn) {
        //Computer turn
        var rows = this.state.rows;
        var slot = rows[randomNumber(0,rows.length)];
        /*
        while(grid[slot][1].slot != "empty") {
          console.log("selecting another");
          slot = rows[randomNumber(0,rows.length)];
        }*/
        var grrow = grid[slot];
        for(var i=1;i<7;i++) {
          var grcol = grrow[i];
          if(grcol.slot === "empty") {
            //clear previous
            if(i>1) {
              grrow[i-1].slot = "empty";
            }
            if(grcol.slot === "empty") {
              grcol.slot = "yellow";
            }
            this.setState({grid:grid});
          }
        }
        this.check4();
        playerTurn = true;
      }
      if(this.checkFull()) {
        this.setState({isFinished:true});
      }
    }
    this.setState({playerTurn:playerTurn});

  }

  render() {
    return (
        //Main Board
        <Container id="content"><button onClick="Test Updat"></button></Container>
    );
  }

}

export default TestUpdate;
