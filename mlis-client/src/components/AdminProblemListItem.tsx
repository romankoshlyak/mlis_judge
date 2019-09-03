import RemoveProblemMutation from './../mutations/RemoveProblemMutation';
import ChangeProblemMutation from './../mutations/ChangeProblemMutation';
import ProblemTextInput from './ProblemTextInput';

import * as React from 'react';
import { createFragmentContainer, RelayProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';

import { AdminProblemListItem_problem } from './__generated__/AdminProblemListItem_problem.graphql';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';

interface Props {
  relay: RelayProp
  problem: AdminProblemListItem_problem
}

class AdminProblemListItem extends React.Component<Props> {
  state = {
    isEditing: false,
  };
  _handleRemoveClick = () => {
    this._removeProblem();
  };
  _handleEditClick = () => {
    this._setEditMode(true);
  };
  _handleTextInputCancel = () => {
    this._setEditMode(false);
  };
  _handleTextInputDelete = () => {
    this._setEditMode(false);
    this._removeProblem();
  };
  _handleTextInputSave = (text: string) => {
    this._setEditMode(false);
    ChangeProblemMutation.commit(
      this.props.relay.environment,
      text,
      this.props.problem,
    );
  };
  _removeProblem() {
    RemoveProblemMutation.commit(
      this.props.relay.environment,
      this.props.problem.id,
    );
  }
  _setEditMode = (shouldEdit: boolean) => {
    this.setState({isEditing: shouldEdit});
  };
  renderTextInput() {
    return (
      <ProblemTextInput
        className="edit"
        commitOnBlur={true}
        initialValue={this.props.problem.text}
        onCancel={this._handleTextInputCancel}
        onDelete={this._handleTextInputDelete}
        onSave={this._handleTextInputSave}
      />
    );
  }
  render() {
    return (
      <ListGroupItem>
          {this.props.problem.text}
          <ButtonToolbar>
            <Button bsStyle="warning" onClick={this._handleEditClick}>Edit</Button>
            <Button bsStyle="danger" onClick={this._handleRemoveClick}>Delete</Button>
          </ButtonToolbar>
        {this.state.isEditing && this.renderTextInput()}
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(AdminProblemListItem, {
  problem: graphql`
    fragment AdminProblemListItem_problem on Problem {
      id,
      text,
    }
  `,
});
