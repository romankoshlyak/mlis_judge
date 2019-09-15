import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { RankingContainer_main } from './__generated__/RankingContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
  relay: RelayRefetchProp,
  main: RankingContainer_main,
}

class RankingContainer extends React.Component<Props> {
  render() {
    return (
      <Authorized main={this.props.main}>
        <Panel>
          <Panel.Body>
            <h1>GLOBAL RANKING: Under construction</h1>
          </Panel.Body>
        </Panel>
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    RankingContainer,
    {
      main: graphql`
        fragment RankingContainer_main on Main {
          ...Authorized_main
        }`,
    },
    graphql`
      query RankingContainerQuery {
        main {
          ...RankingContainer_main
        }
      }`
);