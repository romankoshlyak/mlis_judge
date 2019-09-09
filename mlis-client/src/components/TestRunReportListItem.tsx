import * as React from 'react';
import { createFragmentContainer, RelayProp, Disposable } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';

import { RunStatus, TestRunReportListItem_report } from './__generated__/TestRunReportListItem_report.graphql';
import { TestRunReportListItemSubscriptionResponse } from './__generated__/TestRunReportListItemSubscription.graphql';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import { requestSubscription } from 'react-relay';

import TestRunReport from './TestRunReport';

interface Props {
  relay: RelayProp
  report: TestRunReportListItem_report
}

const testRunReportChangedSubscription = graphql`
  subscription TestRunReportListItemSubscription($id: ID!) {
    testRunReportChanged(id: $id) {
      status
      isAccepted
      ...TestRunReportListItem_report
    }
  }
`;

const FINISHED: RunStatus = "FINISHED";

class TestRunReportListItem extends React.Component<Props> {
  private subsription: Disposable | null = null;
  componentDidMount() {
    if (this.props.report.status !== FINISHED) {
      this.subsription = requestSubscription(
        this.props.relay.environment,
        {
          subscription: testRunReportChangedSubscription,
          variables: {id: this.props.report.id},
          onCompleted: () => {
            this.disposeSubscription();
          },
          onNext: (response) => {
            if ((response as TestRunReportListItemSubscriptionResponse).testRunReportChanged.status === FINISHED) {
              this.disposeSubscription();
            }
          },
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
        <TestRunReport report={this.props.report} />
      </ListGroupItem>
    );
  }
}
export default createFragmentContainer(
  TestRunReportListItem,
  {
    report: graphql`
      fragment TestRunReportListItem_report on TestRunReport {
        id
        status
        isAccepted
        ...TestRunReport_report
      }
    `,
  },
);
