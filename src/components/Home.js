import React, { Component } from "react";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import WaitCircle from './waitcircle.js';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
    this.handlePlayComputer = this.handlePlayComputer.bind(this);
    this.handlePlayHuman = this.handlePlayHuman.bind(this);
  }

  componentDidMount(){

  }

  handleRegister() {
    this.props.history.push("/register");
  }

  handlePlayComputer() {
    this.props.history.push("/playcomputer");
  }

  handlePlayHuman() {
    this.props.history.push("/playhuman");
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <Row>
              <Col md={2}></Col>
              <Col md={4}><Button onClick={this.handlePlayComputer}>Play against computer</Button></Col>
              <Col md={4}><Button onClick={this.handlePlayHuman}>Play against human</Button></Col>
              <Col md={2}></Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Home;
