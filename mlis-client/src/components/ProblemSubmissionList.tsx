import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ProblemSubmissionList_problem } from './__generated__/ProblemSubmissionList_problem.graphql';
import ProblemSubmissionListItem from './ProblemSubmissionListItem';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
  style?: React.CSSProperties
  problem: ProblemSubmissionList_problem
}

class ProblemSubmissionList extends React.Component<Props> {
  renderSubmissions() {
    const edges = this.props.problem.submissions.edges.slice(0);
    return edges.reverse().map(edge => {
      const node = edge.node;
      return (
        <ProblemSubmissionListItem key={node.id} submission={node} />
      );
    });
  }
  render() {
    return (
      <Panel defaultExpanded style={this.props.style}>
        <Panel.Heading>
          <Panel.Title>
            <Panel.Toggle>Submissions:</Panel.Toggle>
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <ListGroup>
            {this.renderSubmissions()}
          </ListGroup>
        </Panel.Collapse>
      </Panel>
    );
  }
}

export default createFragmentContainer(ProblemSubmissionList, {
  problem: graphql`
    fragment ProblemSubmissionList_problem on Problem {
      submissions(
        last: 10
      ) @connection(key: "ProblemSubmissionList_submissions") {
        edges {
          node {
            id
            ...ProblemSubmissionListItem_submission
          }
        }
      }
    }
  `,
});
