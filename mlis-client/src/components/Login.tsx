import React, { Component } from 'react';
import Facebook from './Facebook';
import ReactPlayer from 'react-player'
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
  onLogin: any,
}
export default class Login extends Component<Props> {
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title style={{textAlign: "center"}}>MLIS - machine learning in seconds</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <div style={{display: "flex", justifyContent: "center"}}>
            <ReactPlayer url='https://www.youtube.com/watch?v=4DUhxaV9GeQ' controls={true} />
          </div>
          <div style={{display: "flex", justifyContent: "center"}}>
            <Facebook onLogin={this.props.onLogin} />
          </div>
        </Panel.Body>
      </Panel>
    );
  }
}