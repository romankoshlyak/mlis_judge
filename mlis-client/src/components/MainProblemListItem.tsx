import * as React from 'react';
import { createFragmentContainer, RelayProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { Link } from 'react-router-dom';

import { MainProblemListItem_problem } from './__generated__/MainProblemListItem_problem.graphql';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';

interface Props {
  relay: RelayProp
  problem: MainProblemListItem_problem
}

class MainProblemListItem extends React.Component<Props> {
  render() {
    return (
      <ListGroupItem>
          <ButtonToolbar>
            <Link to={`/problem/${this.props.problem.id}`}>{this.props.problem.name}</Link>
          </ButtonToolbar>
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(MainProblemListItem, {
  problem: graphql`
    fragment MainProblemListItem_problem on Problem {
      id
      name
    }
  `,
});
