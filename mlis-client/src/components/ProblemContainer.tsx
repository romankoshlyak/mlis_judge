import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import ProblemSubmissionList from './ProblemSubmissionList';
import { ProblemContainer_main } from './__generated__/ProblemContainer_main.graphql';
import SubmissionEditor from './SubmissionEditor';
import ProblemDetails from './ProblemDetails';
import Button from 'react-bootstrap/lib/Button';
import { LinkContainer } from 'react-router-bootstrap';
import Authorized from './Authorized';

interface Props {
  relay: RelayRefetchProp,
  main: ProblemContainer_main,
}

class ProblemContainer extends React.Component<Props> {
  renderProblem() {
    if (this.props.main.viewer == null) {
      return null;
    }
    const noMargin = {
      marginBottom: 0,
    };
    const problem = this.props.main.viewer.problem;
    return (
      <>
        <LinkContainer to={`/problem_ranking/${problem.id}`}>
          <Button bsStyle="success" block>See ranking</Button>
        </LinkContainer>
        <ProblemDetails problem={problem} style={noMargin} />
        <SubmissionEditor problem={problem} style={noMargin} />
        <ProblemSubmissionList problem={problem} style={noMargin} />
      </>
    );
  }
  render() {
    return (
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        {this.renderProblem()}
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    ProblemContainer,
    {
      main: graphql`
        fragment ProblemContainer_main on Main @argumentDefinitions(
          id: { type: "ID!" }
        ) {
          ...Authorized_main
          viewer {
            problem(id:$id) {
              id
              ...ProblemDetails_problem
              ...SubmissionEditor_problem
              ...ProblemSubmissionList_problem
            }
          }
        }`,
    },
    graphql`
      query ProblemContainerQuery($id: ID!) {
        main {
          ...ProblemContainer_main @arguments(id: $id)
        }
      }`
);