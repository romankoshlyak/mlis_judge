import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import MainProblemList from './MainProblemList';
import { MainContainer_main } from './__generated__/MainContainer_main.graphql';
import Authorized from './Authorized';

interface Props {
  relay: RelayRefetchProp,
  main: MainContainer_main,
}

class MainContainer extends React.Component<Props> {
  renderMain() {
    if (this.props.main.viewer == null) {
      return null;
    }
    return (
      <MainProblemList viewer={this.props.main.viewer} />
    );
  }
  render() {
    return (
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        {this.renderMain()}
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    MainContainer,
    {
      main: graphql`
        fragment MainContainer_main on Main {
          ...Authorized_main
          viewer {
            ...MainProblemList_viewer
          }
        }`,
    },
    graphql`
      query MainContainerQuery {
        main {
          ...MainContainer_main
        }
      }`
);