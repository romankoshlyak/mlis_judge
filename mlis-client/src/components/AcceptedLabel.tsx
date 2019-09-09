import * as React from 'react';
import { RunStatus } from './__generated__/ProblemSubmissionListItem_submission.graphql';
import Label from 'react-bootstrap/lib/Label';
import { requireValue } from '../utils';

interface Props {
  status: RunStatus,
  isAccepted: boolean | null,
}

class AcceptedLabel extends React.Component<Props> {
  render() {
    if (this.props.status === "FINISHED") {
        const isAccepted = requireValue(this.props.isAccepted);
        if (isAccepted) {
            return (
                <Label bsStyle="success">ACCEPTED</Label>
            );
        } else {
            return (
                <Label bsStyle="danger">REJECTED</Label>
            );
        }
    } else if (this.props.status === "RUNNING") {
        return (
            <Label bsStyle="warning">RUNNING</Label>
        );
    } else {
        return (
            <Label bsStyle="info">SCHEDULED</Label>
        );
    }
  }
}

export default AcceptedLabel;