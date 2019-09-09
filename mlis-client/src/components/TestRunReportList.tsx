import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { TestRunReportList_report } from './__generated__/TestRunReportList_report.graphql';
import TestRunReportListItem from './TestRunReportListItem';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import { Panel } from 'react-bootstrap';

interface Props {
  report: TestRunReportList_report
}

class TestRunReportList extends React.Component<Props> {
  renderReports() {
    const edges = this.props.report.testRunReports.edges;
    const sortedEdges = edges.slice().sort((a, b) => a.node.test.number - b.node.test.number)
    return sortedEdges.map(edge => {
      const node = edge.node;
      return (
        <TestRunReportListItem key={node.id} report={node} />
      );
    });
  }
  render() {
    return (
      <Panel defaultExpanded>
        <Panel.Heading>
          <Panel.Title toggle>Tests</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Panel.Collapse>
            <ListGroup>
              {this.renderReports()}
            </ListGroup>
          </Panel.Collapse>
        </Panel.Body>
      </Panel>
    );
  }
}

export default createFragmentContainer(TestRunReportList, {
  report: graphql`
    fragment TestRunReportList_report on TestSetRunReport {
      testRunReports(
        last: 1000
      ) @connection(key: "TestRunReportList_testRunReports") {
        edges {
          node {
            id
            test {
              number
            }
            ...TestRunReportListItem_report
          }
        }
      }
    }
  `,
});
