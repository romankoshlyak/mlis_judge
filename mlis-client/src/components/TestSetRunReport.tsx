import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';

import { TestSetRunReport_report } from './__generated__/TestSetRunReport_report.graphql';
import Label from 'react-bootstrap/lib/Label';
import Table from 'react-bootstrap/lib/Table';

interface Props {
  report: TestSetRunReport_report
}

class TestSetRunReport extends React.Component<Props> {
  formatNumber = (number:number|null) => {
    if (number != null) {
      return number.toFixed(2);
    }
    return 'NA';
  }
  render() {
    let accepted = null;
    const report = this.props.report;
    const isAccepted = report.isAccepted;
    if (isAccepted == null) {
      accepted = (
        <Label bsStyle="warning">
          [WAITING...]
        </Label>
      );
    } else if (isAccepted) {
      accepted = (
        <Label bsStyle="success">
          [ACCEPTED]
        </Label>
      );
    } else {
      accepted = (
        <Label bsStyle="danger">
          [REJECTED]
        </Label>
      );
    }
    let table = null;
    if (isAccepted != null) {
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
      <div>
        {accepted}
        {table}
      </div>
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
