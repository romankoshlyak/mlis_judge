import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { UserContainer_main } from './__generated__/UserContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
  relay: RelayRefetchProp,
  main: UserContainer_main,
}

class UserContainer extends React.Component<Props> {
  render() {
    return (
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        <Panel>
          <Panel.Body>
            <h1>USER: Under construction</h1>
          </Panel.Body>
        </Panel>
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    UserContainer,
    {
      main: graphql`
        fragment UserContainer_main on Main {
          ...Authorized_main
        }`,
    },
    graphql`
      query UserContainerQuery {
        main {
          ...UserContainer_main
        }
      }`
);