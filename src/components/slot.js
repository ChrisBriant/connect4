import React, { Component } from "react";
//The images below are used to create an animation
import empty from '../assets/empty.png'
import red from '../assets/red.png'
import yellow from '../assets/yellow.png'


class Slot extends Component {

  constructor(props) {
    super(props);
    //import circle1 from '../assets/circle/circle1.svg'
    //this.state = {}
  }

  getImage() {
    if(this.props.imageName === 'empty') {
      return empty;
    } else if(this.props.imageName === 'red') {
      return red;
    } else if(this.props.imageName === 'yellow') {
      return yellow;
    }
  }


  render() {
    return (
        <img alt="connect4image" src={this.getImage()} id={this.props.id}/>
    );
  }
}

export default Slot;
