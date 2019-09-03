import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { AdminProblemList_viewer } from './__generated__/AdminProblemList_viewer.graphql';
import AdminProblemListItem from './AdminProblemListItem';
import ListGroup from 'react-bootstrap/lib/ListGroup';

interface Props {
  viewer: AdminProblemList_viewer
}

class AdminProblemList extends React.Component<Props> {
  renderProblems() {
    return this.props.viewer.problems!.edges!.map(edge => {
      const node = edge!.node!;
      return (
        <AdminProblemListItem key={node.id} problem={node} />
      );
    });
  }
  render() {
    return (
      <ListGroup>
        {this.renderProblems()}
      </ListGroup>
    );
  }
}

export default createFragmentContainer(AdminProblemList, {
  viewer: graphql`
    fragment AdminProblemList_viewer on AdminViewer {
      problems(
        first: 2147483647  # max GraphQLInt
      ) @connection(key: "AdminProblemList_problems") {
        edges {
          node {
            id
            ...AdminProblemListItem_problem
          }
        }
      }
    }
  `,
});
