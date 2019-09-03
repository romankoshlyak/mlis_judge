import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import AdminProblemList from './AdminProblemList';
import { AdminContainer_admin } from './__generated__/AdminContainer_admin.graphql';
import ProblemTextInput from './ProblemTextInput';
import AddProblemMutation from './../mutations/AddProblemMutation';
import { Panel } from 'react-bootstrap';
import Facebook from './Facebook';

interface Props {
  relay: RelayRefetchProp,
  admin: AdminContainer_admin,
}

class AdminContainer extends React.Component<Props> {
  _refetch = () => {
    this.props.relay.refetch(
      {},  // Our refetchQuery needs to know the `itemID`
      null,  // We can use the refetchVariables as renderVariables
      null,
      {force: true},  // Assuming we've configured a network layer cache, we want to ensure we fetch the latest data.
    );
  }
  _handleTextInputSave = (text: string) => {
    AddProblemMutation.commit(
      this.props.relay.environment,
      text,
    );
  };
  render() {
    if (this.props.admin.viewer == null) {
      return (
        <Facebook onLogin={this._refetch}/>
      )
    }
    return (
      <div>
        <div>Your name: {this.props.admin.viewer.user.name}</div>
        <Panel>
          <Panel.Heading>
            <Panel.Title>Problem list:</Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <ProblemTextInput
              autoFocus={true}
              onSave={this._handleTextInputSave}
              placeholder="Enter problem statement here"
            />
            <AdminProblemList viewer={this.props.admin.viewer} />
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

export default createRefetchContainer(
  AdminContainer,
  {
    admin: graphql`
      fragment AdminContainer_admin on Admin {
        viewer {
          ...AdminProblemList_viewer
          user {
            name
          }
        }
      }
    `,
  },
  graphql`
    query AdminContainerQuery {
      admin {
        ...AdminContainer_admin
      }  
    }`
);