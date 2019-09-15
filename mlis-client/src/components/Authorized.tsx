import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import Login from './Login';
import Viewer from './Viewer';
import { Authorized_main } from './__generated__/Authorized_main.graphql';

interface Props {
  relay: RelayRefetchProp,
  main: Authorized_main,
}

class Authorized extends React.Component<Props> {
  _refetch = () => {
    this.props.relay.refetch(
      {},  // Our refetchQuery needs to know the `itemID`
      null,  // We can use the refetchVariables as renderVariables
      null,
      {force: true},  // Assuming we've configured a network layer cache, we want to ensure we fetch the latest data.
    );
  }
  render() {
    if (this.props.main.viewer == null) {
      return (
        <Login onLogin={this._refetch}/>
      )
    }
    return (
      <div>
        <Viewer viewer={this.props.main.viewer} onLogout={this._refetch} />
        <div>
            {this.props.children}
        </div>
      </div>
    );
  }
}

export default createRefetchContainer(
    Authorized,
    {
      main: graphql`
        fragment Authorized_main on Main {
          viewer {
            ...Viewer_viewer
          }
        }`,
    },
    graphql`
      query AuthorizedQuery {
        main {
          ...Authorized_main
        }
      }`
);