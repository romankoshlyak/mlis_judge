import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { RankingContainer_main } from './__generated__/RankingContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';
import { Link } from 'react-router-dom';

interface Props {
  relay: RelayRefetchProp,
  main: RankingContainer_main,
}

class RankingContainer extends React.Component<Props> {
  renderRankings() {
    if (this.props.main.viewer == null) {
      return null;
    }
    const viewer = this.props.main.viewer;
    const edges = viewer.globalRanking!.edges.slice(0);
    const lines = edges.map((edge, index) => {
      const node = edge.node;
      return (
        <tr key={index}>
          <td>{index+1}</td>
          <td><Link to={`/user/${node.user.id}`}>{node.user.name}</Link></td>
          <td>{node.points}</td>
        </tr>
      );
    });
    return (
      <Panel>
        <Panel.Body>
        <h1>Global ranking</h1>
        <h3>You get MAX(1001-PROBLEM RANKING POSITION,0) points for each problem you solved</h3>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>#</th>
              <th>User name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {lines}
          </tbody>
        </Table>
        </Panel.Body>
      </Panel>
    );
  }
  render() {
    return (
      <Authorized main={this.props.main}>
        {this.renderRankings()}
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
          viewer {
            globalRanking(
              first: 100
            ) @connection(key: "RankingContainer_globalRanking") {
              edges {
                node {
                  user {
                    id
                    name
                  }
                  points
                }
              }
            }
          }
        }`,
    },
    graphql`
      query RankingContainerQuery {
        main {
          ...RankingContainer_main
        }
      }`
);