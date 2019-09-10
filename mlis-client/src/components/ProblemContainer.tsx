import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import ProblemSubmissionList from './ProblemSubmissionList';
import Facebook from './Facebook';
import Viewer from './Viewer';
import { ProblemContainer_main } from './__generated__/ProblemContainer_main.graphql';
import SubmissionEditor from './SubmissionEditor';
import ProblemDetails from './ProblemDetails';

interface Props {
  relay: RelayRefetchProp,
  main: ProblemContainer_main,
}

class ProblemContainer extends React.Component<Props> {
  _refetch = () => {
    this.props.relay.refetch(
      {},
      null,
      null,
      {force: true},
    );
  }
  render() {
    if (this.props.main.viewer == null) {
      return (
        <Facebook onLogin={this._refetch}/>
      )
    }
    const noMargin = {
      marginBottom: 0,
    };

    const problem = this.props.main.viewer.problem;
    return (
      <div>
        <Viewer viewer={this.props.main.viewer} onLogout={this._refetch} />
        <ProblemDetails problem={problem} style={noMargin} />
        <SubmissionEditor problem={problem} style={noMargin} />
        <ProblemSubmissionList problem={problem} style={noMargin} />
      </div>
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
          viewer {
            ...Viewer_viewer
            problem(id:$id) {
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