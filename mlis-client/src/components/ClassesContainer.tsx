import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ClassesContainer_main } from './__generated__/ClassesContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
  relay: RelayRefetchProp,
  main: ClassesContainer_main,
}

class ClassesContainer extends React.Component<Props> {
  render() {
    return (
      <Authorized main={this.props.main}>
        <Panel>
          <Panel.Body>
            <h1>CLASSES: Under construction</h1>
          </Panel.Body>
        </Panel>
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    ClassesContainer,
    {
      main: graphql`
        fragment ClassesContainer_main on Main {
          ...Authorized_main
        }`,
    },
    graphql`
      query ClassesContainerQuery {
        main {
          ...ClassesContainer_main
        }
      }`
);