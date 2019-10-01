import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { MetricType, ProblemRankingContainer_main } from './__generated__/ProblemRankingContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';
import { Link } from 'react-router-dom';
import { assertTrue } from '../utils';

interface Props {
  relay: RelayRefetchProp,
  main: ProblemRankingContainer_main,
}

class ProblemRankingContainer extends React.Component<Props> {
  renderMetricName(metric: MetricType) {
    switch (metric) {
      case "MODEL_SIZE":
        return "Mean model size";
      case "TRAINING_STEPS":
        return "Mean training steps";
      case "TRAINING_TIME":
        return "Mean training time";
      case "TRAIN_EVALUATION_TIME":
        return "Mean train evaluation time";
      case "TRAIN_METRIC":
        return "Mean train metric";
      case "TRAIN_ACCURACY":
        return "Mean train accuracy";
      case "TEST_EVALUATION_TIME":
        return "Mean test evaluation time";
      case "TEST_METRIC":
        return "Mean test metric";
      case "TEST_ACCURACY":
        return "Mean test accuracy";
      default:
        assertTrue(false);
    }
  }
  renderRankings() {
    if (this.props.main.viewer == null) {
      return null;
    }
    const viewer = this.props.main.viewer;
    const problem = viewer.problem;
    const metrics = problem.metrics.slice().sort((a, b) => {
      return a.number - b.number;
    })
    const edges = problem.ranking.edges.slice(0);
    const lines = edges.map((edge, index) => {
      const node = edge.node;
      return (
        <tr key={index}>
          <td>{index+1}</td>
          <td><Link to={`/user/${node.user.id}`}>{node.user.name}</Link></td>
          {
            (() => {
              const metricValues = node.submission.testSetRunReport.metricValues;
              const values = metricValues.reduce((obj:any, item) => {
                obj[item.metric.id] = item.value;
                return obj;
              }, {});

              return metrics.map((metric, index) => {
                return (
                  <td key={index}>{values[metric.id]}</td>
                )
              })
            })()
          }
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
              {
                metrics.map((metric, index) => {
                  return (
                    <th key={index}>{this.renderMetricName(metric.type)}</th>
                  )
                })
              }
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
              metrics {
                id
                number
                type
              }
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
                    submission {
                      testSetRunReport {
                        metricValues {
                          metric {
                            id
                          }
                          value
                        }
                      }
                    }
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