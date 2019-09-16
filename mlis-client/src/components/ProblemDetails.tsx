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
    let link = null;
    if (this.props.problem.textUrl != null) {
      link = (
        <a href={this.props.problem.textUrl}>{this.props.problem.textUrl}</a>
      );
    }
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
        <h3>{this.props.problem.name}</h3>
        <div>
          {this.props.problem.text}
        </div>
        <div>
          {link}
        </div>
        <h3>Data provider:</h3>
        <pre>
          {this.props.problem.dataProvider}
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
      textUrl
      dataProvider
    }
  `,
});
