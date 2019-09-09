import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import Panel from 'react-bootstrap/lib/Panel';

import Facebook from './Facebook';
import Viewer from './Viewer';
import TestRunReportList from './TestRunReportList';
import TestSetRunReport from './TestSetRunReport';
import { SubmissionContainer_main } from './__generated__/SubmissionContainer_main.graphql';
import { SubmissionContainer_submission } from './__generated__/SubmissionContainer_submission.graphql';
import { requireValue } from './../utils';

interface Props {
  relay: RelayRefetchProp,
  main: SubmissionContainer_main
  submission: SubmissionContainer_submission | null
}

class SubmissionContainer extends React.Component<Props> {
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
    const submission = requireValue(this.props.submission);
    return (
      <div>
        <Viewer viewer={this.props.main.viewer} onLogout={this._refetch} />
        <div>
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
        </div>
      </div>
    );
  }
}

export default createRefetchContainer(
    SubmissionContainer,
    {
      main: graphql`
        fragment SubmissionContainer_main on Main {
          viewer {
            ...Viewer_viewer
          }
        }`,
      submission: graphql`
        fragment SubmissionContainer_submission on Submission {
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
        }`,
    },
    graphql`
      query SubmissionContainerQuery {
        main {
          viewer {
            ...Viewer_viewer
          }
        }
      }`
);