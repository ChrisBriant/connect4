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

const ENDPOINT = "http://localhost:5000";

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

class UIPanel extends Component {


  constructor(props) {
    super(props);
    if(this.props.multiPlayer) {
      this.initGame();
      var playerTurn = false;
    } else {
      var playerTurn = true;
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
      //cardsDisabled: true,
      isFinished: false,
      //numberOfCards: 25,
      //drawCount: 0,
      //connected: false,
      //cardDrawn: false,
      //guessMade: false,
      //drawReady: true,
      //otherPlayerFound: false,
      //playerPickedCard: false,
      //playerPick: false,
      //cardMessage: "Click draw card to select the first card from the server",
      //turns: turns,
      //otherPlayerVerdict:null,
      //results: [],
      grid: grid,
      playerTurn: playerTurn,
      playerColor: "red",
      rows: [0,1,2,3,4,5],
      //Related to messagebox
      gridWidth:0,
      gridHeight:0,
      displayMessage:'none',
      messageWidth:1,
      messageHeight:1,
      message: "",
      exitVisible: false
    }
    //this.clickCard = this.clickCard.bind(this);
    //this.drawCard = this.drawCard.bind(this);
    //this.handleChangeCardCount = this.handleChangeCardCount.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.goToHome = this.goToHome.bind(this);
    this.initGame = this.initGame.bind(this);
    //this.finish = this.finish.bind(this);
    //this.getCardName = this.getCardName.bind(this);
    //this.getVerdict = this.getVerdict.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.hoverSlot = this.hoverSlot.bind(this);
    this.leaveSlot = this.leaveSlot.bind(this);
    this.clickSlot = this.clickSlot.bind(this);
  }


  /*
  getCardName(id) {
    return null;
  }*/

  componentDidMount(){
    var gridHeight = document.getElementById('content').clientHeight;
    var gridWidth = document.getElementById('content').clientWidth;
    this.setState({gridWidth:gridWidth,gridHeight:gridHeight});
  }

  componentDidUpdate(prevProps,prevState){
    if(prevState.message != this.state.message) {
      var messageHeight = document.getElementById('message-panel').clientHeight;
      var messageWidth = document.getElementById('message-panel').clientWidth;
      this.setState({messageHeight:messageHeight,messageWidth:messageWidth});
    }
  }


  scrollToBottom() {
    animateScroll.scrollToBottom({
      containerId: "resultpanel"
    });
  }


  initGame() {
    var component = this;
    this.socket = socketIOClient.connect(ENDPOINT);

    this.socket.on('socketID', function(playerId) {
      console.log("Connect");
      this.emit('connect4',component.state.name);
      component.setState({playerId:playerId});
    });

    this.socket.on('pair', function(pair) {
      var message = component.state.message;
      var displayMessage = component.state.displayMessage;
      console.log(pair,component.state.playerId);
      if(pair[0].id === component.state.playerId.toString()) {
        console.log("playrr 1");
        message = "You Start!";
        displayMessage = "inline-block";
        setInterval(function() {
          component.setState({displayMessage:"none;"});
        }, 1000);
        var playerColor = "red";
        var playerTurn = true;
      } else {
        var playerColor = "yellow";
        var playerTurn = false;
      }
      component.setState({pair:pair,playerColor:playerColor,otherPlayerFound:true,playerTurn:playerTurn,message:message,displayMessage:displayMessage});
    });

    this.socket.on('yourturn', function(grid) {
      console.log("My Turn");
      console.log(grid);
      //Flash message
      var message = component.state.message;
      var displayMessage = component.state.displayMessage;
      message = "Your Turn!";
      displayMessage = "inline-block";
      setInterval(function() {
        component.setState({displayMessage:"none;"});
      }, 1000)
      //Convert grid
      var newGrid = [];
      for(var i=1;i<7;i++) {
        var cols = [];
        var row = grid[i-1];
        for(var j=1;j<7;j++) {
          cols[j] = row[j];
        }
        newGrid.push(cols);
      }
      component.setState({playerTurn:true,grid:newGrid,message:message,displayMessage:displayMessage});
    });

    this.socket.on('winner', function(playerId) {
      if(component.state.playerId === playerId) {
        var message = "Congratulations! You have won"
      } else {
        var otherPlayerName = component.state.pair.filter(p => p.id != playerId)[0].name;
        var message = "Sorry " + otherPlayerName + " has won. Better luck next time";
      }
      component.setState({isFinished:true,message:message,displayMessage:"inline-block",exitVisible:true});
      this.disconnect();
    });

    this.socket.on('otherdisconnected', function() {
      var message = "Sorry, the other player has disconnected";
      component.setState({isFinished:true,message:message,displayMessage:"inline-block",exitVisible:true});
      this.disconnect();
    });

  }

  /*
  initGame() {

    var component = this;
    this.socket = socketIOClient.connect(ENDPOINT);

    this.socket.on('socketID', function() {
      this.emit('connect4',component.state.name);
    });

    this.socket.on('pair', function(pair) {
      console.log(pair);
    });

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
  }*/


  handleChangeName(e) {
    this.setState({name:e.target.value});
  }

  handleStart() {
    this.setState({isStart:false}); //,displayMessage:'inline-block',message:'This is a message panel'});
    //this.initGame();
  }

  /*
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
  }*/

  goToHome() {
    this.props.history.push('/')
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


  check4(human) {
    var grid = this.state.grid;
    var finished = false;
    //console.log("grid",grid);
    var flipped = this.flipGrid(grid);
    //console.log("flipped",flipped);
    var diagTransformed = this.transformDiag(grid);
    //console.log("transformed",diagTransformed)
    var diagTransformedTopBottom = this.transformDiagTopBottom(grid);
    //console.log("transformed",diagTransformedTopBottom);
    if(this.checkCols(grid,"col")) {
      var finished = true;
    } else if(this.checkCols(flipped,"row")) {
      var finished = true;
    } else if(this.checkCols(diagTransformed,"diag")) {
      var finished = true;
    } else if(this.checkCols(diagTransformedTopBottom,"diag")) {
      var finished = true;
    }

    console.log("Finished",finished)
    if(this.props.multiPlayer && finished) {
      this.socket.emit("connect4-winner",this.state.playerId,this.state.pair[0].pairId);
    } else if (!this.props.multiPlayer && finished) {
      if(human) {
        var message = "Congratulations! You have won";
      } else {
        var message = "Sorry, the computer has won";
      }
      this.setState({isFinished:finished,exitVisible:true,message:message,displayMessage:"inline-block"});
    }
    //Check rows
    //var count4 = 1;
    //var prev="empty";
    return finished;
  }

 checkCols(grid,ch) {
   var four = false;
   var winner = null;
   var won = false;

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
           if(prev === this.state.playerColor) {
             var iAmWinner = true;
           } else {
             var iAmWinner = false;
           }
           this.setState({winner:winner,iAmWinner:iAmWinner});
         }
       }
     }
   }
   return four;
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
    var computerTurn = false;
    console.log("playerturn",playerTurn);
    var row = Math.floor(e.target.id / 10);
    //var col = e.target.id % 10;
    var grrow = grid[row-1];

    var firstSlot = grrow[1].slot

    if(playerTurn && firstSlot ==="empty") {
      var computerTurn = true;
      /*
      if(this.state.multiPlayer) {
        var counterColor = this.state.playerColor;
      } else {
        counterColor = "red";
      }*/

      for(var i=1;i<7;i++) {
        playerTurn = false;
        var grcol = grrow[i];
        if(grcol.slot === "empty") {
          //clear previous
          if(i>1) {
            grrow[i-1].slot = "empty";
          }
          if(grcol.slot === "empty") {
            grcol.slot = this.state.playerColor;
          }
          this.setState({grid:grid});
        }
      }
      if(this.props.multiPlayer) {
        console.log("Here",this.state.grid);

        this.socket.emit('connect4-turntaken',this.state.playerId,this.state.pair[0].pairId,this.state.grid);
      }
      if(this.check4(true)) {
        computerTurn = false;
      }
    } else {
      computerTurn = false;
    }
    if(this.checkFull()) {
      var message = "The grid is full no one has won";
      this.setState({isFinished:true,exitVisible:true,message:message,displayMessage:"inline-block"});
      if(this.state.multiPlayer) {
        this.socket.disconnect();
      }
    } else {
      if(!this.props.multiPlayer && computerTurn) {
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
        this.check4(false);
        playerTurn = true;
      }
      if(this.checkFull()) {
        var message = "The grid is full no one has won";
        this.setState({isFinished:true,exitVisible:true,message:message,displayMessage:"inline-block"});
      }
    }
    this.setState({playerTurn:playerTurn});

  }

  render() {
    console.log("Message Panel Dim", this.state.messageWidth);
    var messagePanelPos = {
      left: (this.state.gridWidth/2 - this.state.messageWidth/2) + 'px',
      top: (this.state.gridHeight/2 - this.state.messageHeight/2)  + 'px',
      display: this.state.displayMessage
    };

    var messagePanel =
    <div id="message-panel" className="message-panel" style={messagePanelPos}>
      <p>{this.state.message}</p>
    </div>;

    if(!this.state.isFinished) {
      var grid =
      <div id="grid" className="panel">
          {this.state.grid.map((row,i) => (
              <div className='slotrow' key={i}>
                { row.map((item) => (
                  <div onMouseEnter={this.hoverSlot} onMouseLeave={this.leaveSlot} onClick={this.clickSlot} id={item.idx} key={item.idx}>
                    { <Slot className='slotcol' imageName={item.slot} id={item.idx}/> }
                  </div>
                ))}
              </div>
          ))}
      </div>;
    } else {
      //Make grid unclickable
      var grid =
      <div id="grid" className="panel">
          {this.state.grid.map((row,i) => (
              <div className='slotrow' key={i}>
                { row.map((item) => (
                  <div id={item.idx} key={item.idx}>
                    { <Slot className='slotcol' imageName={item.slot} id={item.idx}/> }
                  </div>
                ))}
              </div>
          ))}
      </div>;
    }

    if(this.state.exitVisible) {
      var exit =
      <div className="buttons"><Button onClick={this.goToHome}>Exit</Button></div>;
    } else {
      var exit = null;
    }

    /*
    if(!this.props.multiPlayer) {
      var selectedCard = <Col>{ !this.state.guessMade ? <img src={placeholder} alt="placeholder" className="card"/> : <img src={this.state.cardSelection} alt="placeholder" className="card"/> }</Col>;
    } else {
      var selectedCard = <Col>{ !this.state.guessMade && !this.state.playerPickedCard ? <img src={placeholder} alt="placeholder" className="card"/> : <img src={this.state.cardSelection}  alt="placeholder" className="card"/> }</Col>;
    }

    if(this.state.isFinished && this.props.multiPlayer && !this.state.playerDisconnect) {
      console.log(this.state.otherPlayer);
      //Produce a panel to show the other player results
      var otherResults = [];
      for(var i=0;i<this.state.otherPlayer.cards.length;i++) {
        otherResults.push({card:this.getCardName(parseInt(this.state.otherPlayer.cards[i])),result:this.state.otherPlayer.results[i]});
      }
      var otherPlayerResults =  <Col><div className="resultpanel">{ otherResults.map( (result,idx) => (
                                  <Row key={idx}>
                                    <Col><img alt="card" src={result.card}></img></Col>
                                    <Col>
                                      { !result.result ? <img src={mistake} alt="cross" className="iconsmall"></img> : <img src={tick} alt="tick" className="iconsmall"></img>  }
                                    </Col>
                                  </Row>
                                ))}</div></Col>
      var otherPlayerScore = <Col>{otherResults.filter(r => r.result).length}  /  { otherResults.length }</Col>
      var otherPlayerName = <Col>{this.state.otherPlayer.name}</Col>;
    } else {
      var otherPlayerName = <Row><Col></Col></Row>;
      var otherPlayerResults = <Col></Col>;
      var otherPlayerScore = <Col></Col>;
    }

    if(!this.props.multiPlayer) {
      var drawButton = <div>{this.state.connected && this.state.drawReady ? <Button variant="outline-warning" onClick={this.drawCard}>Draw Card</Button> : <Button variant="outline-warning" disabled>Draw Card</Button> }</div>
    } else {
      var drawButton = null;
    }*/

    if(this.state.isStart) {
      return (
        <Container id="content">
          {messagePanel}
          <Row>
            <Col md={3}></Col>
            <Col md={3}>
              <label>Enter a nickname:</label>
            </Col>
            <Col md={3}>
              <input value={this.state.name} className="form-control" onChange={this.handleChangeName}/>
            </Col>
            <Col md={3}></Col>
          </Row><br/>
          <Row>
            <Col md={3}></Col>
            <Col md={3}><Button onClick={this.handleStart}>START</Button></Col>
            <Col md={3}><Button onClick={this.goToHome}> Exit</Button></Col>
            <Col md={3}></Col>
          </Row>
        </Container>
      );
    /*} else if(this.state.isFinished && !this.state.multiPlayer) {
      return(
        <Container>
          <Row>
            <Col><h4>Results:</h4></Col>
          </Row>
          <Row>
            <Col><p>No one has won!</p></Col>
          </Row>
        </Container>
      )*/
    /*} else if(this.state.isFinished && !this.state.playerDisconnect) {
      return (
        <Container id="content">
          {messagePanel}
          <Row>
            <Col><h4>Results:</h4></Col>
          </Row>
          <Row>
            <Col>{this.state.name}</Col>
          </Row>
          <Row>
            <Col>{this.state.results.filter(r => r.result).length}  /  { this.state.results.length } </Col>
          </Row>
          <Row>
            <Col>
              <div className="resultpanel">{ this.state.results.map( (result,idx) => (
                  <Row key={idx}>
                    <Col></Col>
                    <Col>

                    </Col>
                  </Row>
                ))}
              </div>
            </Col>
          </Row>
          <br/>
          <Row><Col>{ this.state.verdict }</Col></Row>
          <br/>
          <Row><Col>{ this.state.otherPlayerVerdict }</Col></Row>
          <Row>
            <Col><Button onClick={this.goToHome}>Exit</Button></Col>
          </Row>
        </Container>
      );*/
    /*} else if(this.state.isFinished && this.state.playerDisconnect) {
      return (
        <Container id="content">
          {messagePanel}
          <Row>
            <Col>
            { !this.state.iDisconnected ? <p>The other player has disconnected</p> : <p>You have disconnected</p> }
            <p>Both players must finish their round for scoring to happen.</p>
            </Col>
          </Row>
          <Row>
            <Col><Button onClick={this.goToHome}>Exit</Button></Col>
          </Row>
        </Container>
      );*/
    } else if(this.props.multiPlayer && !this.state.otherPlayerFound) {
      return (
        <Container id="content">
          {messagePanel}
          <Row>
            <Col></Col>
            <Col></Col>
            <h4>Waiting for another player</h4>
            <Col></Col>
            <Col></Col>
          </Row>
          <Row>
            <Col></Col>
            <Col></Col>
            <Col><WaitCircle runAnim={true} speed={100}/></Col>
            <Col></Col>
            <Col></Col>
          </Row>
        </Container>
      );
    } else {
      return (
          //Main Board
          <Container id="content">{messagePanel}{grid}{exit}</Container>
      );
    }
  }
}

export default UIPanel;
