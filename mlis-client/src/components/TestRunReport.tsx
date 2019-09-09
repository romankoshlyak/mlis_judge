import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';

import { TestRunReport_report } from './__generated__/TestRunReport_report.graphql';
import Table from 'react-bootstrap/lib/Table';
import Panel from 'react-bootstrap/lib/Panel';
import AcceptedLabel from './AcceptedLabel';

interface Props {
  report: TestRunReport_report
}

class TestRunReport extends React.Component<Props> {
  render() {
    const report = this.props.report;
    return (
      <div>
        <Panel>
          <Panel.Heading>
            <Panel.Title>
              <Panel.Toggle>
                Test #{report.test.number}
              </Panel.Toggle>
              &nbsp;
              <AcceptedLabel status={report.status} isAccepted={report.isAccepted} />
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              [{report.test.description}]
              <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Value</th>
                    <th>Limit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Model size</td>
                    <td>{report.modelSize}</td>
                    <td>{report.test.modelSizeLimit}</td>
                  </tr>
                  <tr>
                    <td>Training steps</td>
                    <td>{report.trainingSteps}</td>
                    <td>{report.test.trainingStepsLimit}</td>
                  </tr>
                  <tr>
                    <td>Training time</td>
                    <td>{report.trainingTime}</td>
                    <td>{report.test.trainingTimeLimit}</td>
                  </tr>
                  <tr>
                    <td>Evaluation time</td>
                    <td>{report.evaluationTime}</td>
                    <td>{report.test.evaluationTimeLimit}</td>
                  </tr>
                  <tr>
                    <td>Train accuracy</td>
                    <td>{report.trainAccuracy}</td>
                    <td>{report.test.trainAccuracyLimit}</td>
                  </tr>
                  <tr>
                    <td>Test accuracy</td>
                    <td>{report.testAccuracy}</td>
                    <td>{report.test.testAccuracyLimit}</td>
                  </tr>
                </tbody>
              </Table>
              <div>{report.rejectReason}</div>
              <div>StdOut:</div>
              <pre>{report.stdOut}</pre>
              <div>StdErr:</div>
              <pre>{report.stdErr}</pre>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      </div>
    );
  }
}
export default createFragmentContainer(
  TestRunReport,
  {
    report: graphql`
      fragment TestRunReport_report on TestRunReport {
        status
        stdErr
        stdOut
        isAccepted
        rejectReason

        modelSize
        trainingSteps
        trainingTime
        evaluationTime
        trainError
        trainCorrect
        trainTotal
        trainAccuracy
        trainMetric
        testError
        testCorrect
        testTotal
        testAccuracy
        testMetric
        test {
          number
          description
          modelSizeLimit
          trainingStepsLimit
          trainingTimeLimit
          evaluationTimeLimit
          trainAccuracyLimit
          testAccuracyLimit
        }
      }
    `,
  },
);
