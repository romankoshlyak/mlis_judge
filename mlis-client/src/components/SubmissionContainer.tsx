import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import Panel from 'react-bootstrap/lib/Panel';

import TestRunReportList from './TestRunReportList';
import TestSetRunReport from './TestSetRunReport';
import { SubmissionContainer_main } from './__generated__/SubmissionContainer_main.graphql';
import { requireValue } from './../utils';
import Authorized from './Authorized';

interface Props {
  relay: RelayRefetchProp,
  main: SubmissionContainer_main
}

class SubmissionContainer extends React.Component<Props> {
  renderSubmission() {
    const viewer = this.props.main.viewer;
    if (viewer == null) {
      return null;
    }
    const submission = requireValue(viewer.submission);
    return (
      <>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>
              Submission code
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              <pre>
                {submission.code}
              </pre>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
        <Panel defaultExpanded>
          <Panel.Heading>
            <Panel.Title toggle>
              Run details
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              <TestRunReportList report={submission.testSetRunReport} />
              <TestSetRunReport report={submission.testSetRunReport} />
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      </>
    );
  }
  render() {
    return (
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        {this.renderSubmission()}
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    SubmissionContainer,
    {
      main: graphql`
        fragment SubmissionContainer_main on Main @argumentDefinitions(
          id: { type: "ID!" }
        ) {
          ...Authorized_main
          viewer {
            submission(id:$id) {
              id
              problem {
                name
              }
              testSetRunReport {
                status
                ...TestRunReportList_report
                ...TestSetRunReport_report
              }
              code
            }
          }
        }`,
    },
    graphql`
      query SubmissionContainerQuery($id: ID!) {
        main {
          ...SubmissionContainer_main @arguments(id: $id)
        }
      }`
);