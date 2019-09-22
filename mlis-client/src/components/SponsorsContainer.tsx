import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { SponsorsContainer_main } from './__generated__/SponsorsContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
  relay: RelayRefetchProp,
  main: SponsorsContainer_main,
}

class SponsorsContainer extends React.Component<Props> {
  renderSponsors() {
    if (this.props.main.viewer == null) {
      return null;
    }
    return (
      <Panel>
        <Panel.Body>
          <h1>Yes, please</h1>
          <h2>We would like to have sponsors.</h2>
          <h3>Sponsor money will allow us:</h3>
          <ul>
            <li>Add GPU support</li>
            <li>Develop better tutorials</li>
            <li>Develop more 2 seconds problems</li>
          </ul>
          If you want to be our sponsor, please contact as at mlisserver@gmail.com
        </Panel.Body>
      </Panel>
    );
  }
  render() {
    return (
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        {this.renderSponsors()}
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    SponsorsContainer,
    {
      main: graphql`
        fragment SponsorsContainer_main on Main {
          ...Authorized_main
          viewer {
            user {
              id
            }
          }
        }`,
    },
    graphql`
      query SponsorsContainerQuery {
        main {
          ...SponsorsContainer_main
        }
      }`
);