import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ClassesContainer_main } from './__generated__/ClassesContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/lib/Button';
import Table from 'react-bootstrap/lib/Table';
import ApplyForClassMutation from './../mutations/ApplyForClassMutation';
import { viewerCanAccessClass } from '../utils';

interface Props {
  relay: RelayRefetchProp,
  main: ClassesContainer_main,
}

class ClassesContainer extends React.Component<Props> {
  _applyForClass = (classId: string) => {
    ApplyForClassMutation.commit(
      this.props.relay.environment,
      classId
    );
  }
  renderClasses() {
    if (this.props.main.viewer == null) {
      return null;
    }
    const viewer = this.props.main.viewer;
    const edges = viewer.classes.edges.slice(0);
    const lines = edges.map((edge, index) => {
      const node = edge.node;
      let applyButton = null;
      const viewerCanAccess = viewerCanAccessClass(viewer, node) && false;
      if (viewerCanAccess) {
        applyButton = (
          <Link to={`/class/${node.id}`}>Enter</Link>
        )
      } else if (node.viewerIsEleminated) {
        applyButton = (
          <div>Eleminated</div>
        )
      } else {
        applyButton = (
          <Button
            bsStyle="warning"
            disabled={node.studentsCount >= 30 && node.firstTaskDueAt < Date.now()}
            onClick={this._applyForClass.bind(this, node.id)}
          >Apply</Button>
        )
      }
      return (
        <tr key={index}>
          <td>{node.name}</td>
          <td>{new Date(node.startAt).toLocaleString()}</td>
          <td>{new Date(node.firstTaskDueAt).toLocaleString()}</td>
          <td><Link to={`/user/${node.mentor.id}`}>{node.mentor.name}</Link></td>
          <td>{30-node.studentsCount}</td>
          <td>
            <Panel>
              <Panel.Heading>
                <Panel.Title>
                  <Panel.Toggle>
                    Details
                  </Panel.Toggle>
                </Panel.Title>
              </Panel.Heading>
              <Panel.Collapse>
                <h3>Details of the course:</h3>
                <div>
                  {node.description}
                </div>
                <h3>Note: If you don't have time, don't apply now, if you get eliminated from class, you will not be able to join other one for 6 month</h3>
                <h3>Note: Once you applied, you will be invited to Messenger Group Chat within 24 hours, please make sure to check spam folder</h3>
              </Panel.Collapse>
            </Panel>
          </td>
          <td>{applyButton}</td>
        </tr>
      );
    });
    return (
      <Panel>
        <Panel.Body>
          <h1>MLIS Classes</h1>
          <h4>You always wanted to learn machine learning but:</h4>
          <ul>
            <li>did not know where to start</li>
            <li>did not have someone to mentor you</li>
            <li>tried but after hours of framework installations gave up</li>
          </ul>
          <h4>Then MLIS Classes is for You:</h4>
          <ul>
            <li>Class consist of mentor and up to 30 class participants</li>
            <li>Mentor support in format: "I spend 1 hour and I made no progress, give me direction"</li>
            <li>Every week you need to complete a task, or you out (Note: you will not be able to join next MLIS classes for 6 month)</li>
            <li>After every task, you get to see solution and worklog from other participants and mentor</li>
          </ul>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Start</th>
                <th>First task due</th>
                <th>Mentor</th>
                <th>Places left</th>
                <th>Details</th>
                <th>Apply</th>
              </tr>
            </thead>
            <tbody>
              {lines}
            </tbody>
          </Table>
        </Panel.Body>
      </Panel>
    );
  }
  render() {
    return (
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        {this.renderClasses()}
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
          viewer {
            user {
              id
            }
            classes(
              first: 100
            ) @connection(key: "ClassesContainer_classes") {
              edges {
                node {
                  id
                  name
                  description
                  startAt
                  firstTaskDueAt
                  mentor {
                    id
                    name
                  }
                  studentsCount
                  viewerIsApplied
                  viewerIsEleminated
                }
              }
            }
          }
        }`,
    },
    graphql`
      query ClassesContainerQuery {
        main {
          ...ClassesContainer_main
        }
      }`
);