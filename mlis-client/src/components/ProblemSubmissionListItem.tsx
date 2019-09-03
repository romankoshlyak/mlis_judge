import * as React from 'react';
import { createFragmentContainer, RelayProp, Disposable } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { Link } from 'react-router-dom';

import { RunStatus, ProblemSubmissionListItem_submission } from './__generated__/ProblemSubmissionListItem_submission.graphql';
import { ProblemSubmissionListItemSubscriptionResponse } from './__generated__/ProblemSubmissionListItemSubscription.graphql';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import { requestSubscription } from 'react-relay';

import TestSetRunReport from './TestSetRunReport';

interface Props {
  relay: RelayProp
  submission: ProblemSubmissionListItem_submission
}

const testSetRunReportChangedSubscription = graphql`
  subscription ProblemSubmissionListItemSubscription($id: ID!) {
    testSetRunReportChanged(id: $id) {
      status
      ...TestSetRunReport_report
    }
  }
`;

const FINISHED: RunStatus = "FINISHED";

class ProblemSubmissionListItem extends React.Component<Props> {
  private subsription: Disposable | null = null;
  componentDidMount() {
    if (this.props.submission.testSetRunReport.status !== FINISHED) {
      this.subsription = requestSubscription(
        this.props.relay.environment,
        {
          subscription: testSetRunReportChangedSubscription,
          variables: {id: this.props.submission.testSetRunReport.id},
          onCompleted: () => {
            this.disposeSubscription();
          },
          onNext: (response) => {
            if ((response as ProblemSubmissionListItemSubscriptionResponse).testSetRunReportChanged.status === FINISHED) {
              this.disposeSubscription();
            }
          },
          //updater: (store, data) => console.log(data),
        },
      );
    }
  }

  disposeSubscription = () => {
    if (this.subsription != null) {
      this.subsription.dispose()
      this.subsription = null;
    }
  }

  componentWillUnmount() {
    this.disposeSubscription();
  }

  render() {
    return (
      <ListGroupItem>
        <Link to={`/submission/${this.props.submission.id}`}>Submission {this.props.submission.id}</Link>
        <div>{this.props.submission.testSetRunReport.status}</div>
        <TestSetRunReport report={this.props.submission.testSetRunReport} />
      </ListGroupItem>
    );
  }
}
export default createFragmentContainer(
  ProblemSubmissionListItem,
  {
    submission: graphql`
      fragment ProblemSubmissionListItem_submission on Submission {
        id
        testSetRunReport {
          id
          status
          ...TestSetRunReport_report
        }
      }
    `,
  },
);
