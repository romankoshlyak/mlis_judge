import * as React from 'react';
import { createFragmentContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import Login from './Login';
import MainMenu from './MainMenu';
import { Authorized_main } from './__generated__/Authorized_main.graphql';

interface Props {
  mainRelay: RelayRefetchProp,
  main: Authorized_main,
}

class Authorized extends React.Component<Props> {
  _refetch = () => {
    this.props.mainRelay.refetch(
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
        <MainMenu viewer={this.props.main.viewer} onLogout={this._refetch} />
        <div>
            {this.props.children}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
    Authorized,
    {
      main: graphql`
        fragment Authorized_main on Main {
          viewer {
            ...MainMenu_viewer
          }
        }`,
    }
);