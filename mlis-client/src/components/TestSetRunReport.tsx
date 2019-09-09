import * as React from 'react';
import { createFragmentContainer, RelayProp, Disposable } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { requestSubscription } from 'react-relay';

import { TestSetRunReport_report } from './__generated__/TestSetRunReport_report.graphql';
import { TestSetRunReportSubscriptionResponse } from './__generated__/TestSetRunReportSubscription.graphql';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';
import AcceptedLabel from './AcceptedLabel';

interface Props {
  relay: RelayProp
  report: TestSetRunReport_report
}

const testSetRunReportChangedSubscription = graphql`
  subscription TestSetRunReportSubscription($id: ID!) {
    testSetRunReportChanged(id: $id) {
      status
      isAccepted
      ...TestSetRunReport_report
    }
  }
`;
class TestSetRunReport extends React.Component<Props> {
  formatNumber = (number:number|null) => {
    if (number != null) {
      return number.toFixed(2);
    }
    return 'NA';
  }
  private subsription: Disposable | null = null;
  componentDidMount() {
    if (this.props.report.status !== "FINISHED") {
      this.subsription = requestSubscription(
        this.props.relay.environment,
        {
          subscription: testSetRunReportChangedSubscription,
          variables: {id: this.props.report.id},
          onCompleted: () => {
            this.disposeSubscription();
          },
          onNext: (response) => {
            if ((response as TestSetRunReportSubscriptionResponse).testSetRunReportChanged.status === "FINISHED") {
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
    const report = this.props.report;
    let table = null;
    if (report.status === "FINISHED") {
      table = (
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th></th>
              <th>Min</th>
              <th>Mean</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Model size</td>
              <td>{this.formatNumber(report.modelSizeMin)}</td>
              <td>{this.formatNumber(report.modelSizeMean)}</td>
              <td>{this.formatNumber(report.modelSizeMax)}</td>
            </tr>
            <tr>
              <td>Training steps</td>
              <td>{this.formatNumber(report.trainingStepsMin)}</td>
              <td>{this.formatNumber(report.trainingStepsMean)}</td>
              <td>{this.formatNumber(report.trainingStepsMax)}</td>
            </tr>
            <tr>
              <td>Training time</td>
              <td>{this.formatNumber(report.trainingTimeMin)}</td>
              <td>{this.formatNumber(report.trainingTimeMean)}</td>
              <td>{this.formatNumber(report.trainingTimeMax)}</td>
            </tr>
            <tr>
              <td>Evaluation time</td>
              <td>{this.formatNumber(report.evaluationTimeMin)}</td>
              <td>{this.formatNumber(report.evaluationTimeMean)}</td>
              <td>{this.formatNumber(report.evaluationTimeMax)}</td>
            </tr>
            <tr>
              <td>Train accuracy</td>
              <td>{this.formatNumber(report.trainAccuracyMin)}</td>
              <td>{this.formatNumber(report.trainAccuracyMean)}</td>
              <td>{this.formatNumber(report.trainAccuracyMax)}</td>
            </tr>
            <tr>
              <td>Test accuracy</td>
              <td>{this.formatNumber(report.testAccuracyMin)}</td>
              <td>{this.formatNumber(report.testAccuracyMean)}</td>
              <td>{this.formatNumber(report.testAccuracyMax)}</td>
            </tr>
          </tbody>
        </Table>
      );

    }
    return (
      <Panel defaultExpanded>
        <Panel.Heading>
          <Panel.Title>
            <Panel.Toggle>
              Summary
            </Panel.Toggle>
            &nbsp;
            <AcceptedLabel status={report.status} isAccepted={report.isAccepted} />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            {table}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }
}
export default createFragmentContainer(
  TestSetRunReport,
  {
    report: graphql`
      fragment TestSetRunReport_report on TestSetRunReport {
        id
        status
        modelSizeMax
        modelSizeMean
        modelSizeMin
        trainingStepsMax
        trainingStepsMean
        trainingStepsMin
        trainingTimeMax
        trainingTimeMean
        trainingTimeMin
        evaluationTimeMax
        evaluationTimeMean
        evaluationTimeMin
        trainAccuracyMax
        trainAccuracyMean
        trainAccuracyMin
        testAccuracyMax
        testAccuracyMean
        testAccuracyMin
        isAccepted
      }
    `,
  },
);
