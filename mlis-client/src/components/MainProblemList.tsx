
import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { MainProblemList_viewer } from './__generated__/MainProblemList_viewer.graphql';
import MainProblemListItem from './MainProblemListItem';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import { Panel } from 'react-bootstrap';

interface Props {
  viewer: MainProblemList_viewer
}

class MainProblemList extends React.Component<Props> {
  renderProblems() {
    return this.props.viewer.problems!.edges!.map(edge => {
      const node = edge!.node!;
      return (
        <MainProblemListItem key={node.id} problem={node} />
      );
    });
  }
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>Problem list:</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <ListGroup>
            {this.renderProblems()}
          </ListGroup>
        </Panel.Body>
      </Panel>
    );
  }
}

export default createFragmentContainer(MainProblemList, {
  viewer: graphql`
    fragment MainProblemList_viewer on Viewer {
      problems(
        first: 2147483647  # max GraphQLInt
      ) @connection(key: "MainProblemList_problems") {
        edges {
          node {
            id
            ...MainProblemListItem_problem
          }
        }
      }
    }
  `,
});
