import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ProblemRankingContainer_main } from './__generated__/ProblemRankingContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';
import { Link } from 'react-router-dom';

interface Props {
  relay: RelayRefetchProp,
  main: ProblemRankingContainer_main,
}

class ProblemRankingContainer extends React.Component<Props> {
  renderRankings() {
    if (this.props.main.viewer == null) {
      return null;
    }
    const viewer = this.props.main.viewer;
    const edges = viewer.problem.ranking.edges.slice(0);
    const lines = edges.map((edge, index) => {
      const node = edge.node;
      return (
        <tr key={index}>
          <td>{index+1}</td>
          <td><Link to={`/user/${node.user.id}`}>{node.user.name}</Link></td>
          <td>{node.metric}</td>
          <td>{new Date(node.updatedAt).toLocaleString()}</td>
        </tr>
      );
    });
    return (
      <Panel>
        <Panel.Body>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>#</th>
              <th>User name</th>
              <th>Mean training time</th>
              <th>Submission time</th>
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
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        {this.renderRankings()}
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    ProblemRankingContainer,
    {
      main: graphql`
        fragment ProblemRankingContainer_main on Main @argumentDefinitions(
          id: { type: "ID!" }
        ) {
          ...Authorized_main
          viewer {
            problem(id:$id) {
              ranking(
                first: 100
              ) @connection(key: "ProblemRankingContainer_ranking") {
                edges {
                  node {
                    id
                    user {
                      id
                      name
                    }
                    metric
                    updatedAt
                  }
                }
              }
            }
          }
        }`,
    },
    graphql`
      query ProblemRankingContainerQuery($id: ID!) {
        main {
          ...ProblemRankingContainer_main @arguments(id: $id)
        }
      }`
);