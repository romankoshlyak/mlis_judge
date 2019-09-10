import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ProblemDetails_problem } from './__generated__/ProblemDetails_problem.graphql';
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
  style?: React.CSSProperties
  problem: ProblemDetails_problem
}

class ProblemDetails extends React.Component<Props> {
  render() {
    return (
    <Panel style={this.props.style}>
      <Panel.Heading>
        <Panel.Title>
          <Panel.Toggle>
            Problem
          </Panel.Toggle>
        </Panel.Title>
      </Panel.Heading>
        <Panel.Collapse>
          {this.props.problem.name}
          <pre>
            {this.props.problem.text}
          </pre>
        </Panel.Collapse>
    </Panel>
    );
  }
}

export default createFragmentContainer(ProblemDetails, {
  problem: graphql`
    fragment ProblemDetails_problem on Problem {
      name
      text
    }
  `,
});
