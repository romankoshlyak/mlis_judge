import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import MainProblemList from './MainProblemList';
import Login from './Login';
import Viewer from './Viewer';
import { MainContainer_main } from './__generated__/MainContainer_main.graphql';

interface Props {
  relay: RelayRefetchProp,
  main: MainContainer_main,
}

class MainContainer extends React.Component<Props> {
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
        <MainProblemList viewer={this.props.main.viewer} />
      </div>
    );
  }
}

export default createRefetchContainer(
    MainContainer,
    {
      main: graphql`
        fragment MainContainer_main on Main {
          viewer {
            ...MainProblemList_viewer
            ...Viewer_viewer
          }
        }`,
    },
    graphql`
      query MainContainerQuery {
        main {
          viewer {
            ...MainProblemList_viewer
            ...Viewer_viewer
          }
        }
      }`
);