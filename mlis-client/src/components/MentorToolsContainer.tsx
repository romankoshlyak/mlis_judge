import * as React from 'react';
import { createFragmentContainer, RelayProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { MentorToolsContainer_main } from './__generated__/MentorToolsContainer_main.graphql';
import UpdateClassStudentMutation from '../mutations/UpdateClassStudent';
import Panel from 'react-bootstrap/lib/Panel';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';

interface Props {
  relay: RelayProp,
  main: MentorToolsContainer_main,
}

class MentorToolsContainer extends React.Component<Props> {
  __updateClassStudent(classId: string, studentId: string, isEleminated: boolean|null, isAdvanced: boolean|null) {
    console.log(classId, studentId, isEleminated, isAdvanced);
    UpdateClassStudentMutation.commit(
      this.props.relay.environment,
      classId,
      studentId,
      isEleminated,
      isAdvanced
    );
  }
  __renderStudents(classId: string) {
    const students = this.props.main.viewer!.class.students;
    return  students.edges.map((edge, index) => {
      const node = edge.node;
      return (
        <tr key={index}>
          <td><Link to={`/user/${node.student.id}`}>{node.student.name}</Link></td>
          <td>{new Date(node.createdAt).toLocaleString()}</td>
          <td>{node.isEleminated ? 'YES': 'NO'}</td>
          <td>{node.isAdvanced ? 'YES': 'NO'}</td>
          <td>
            <Button
              onClick={this.__updateClassStudent.bind(this, classId, node.id, !node.isEleminated, null)}>
                {node.isEleminated ? 'Restore': 'Eleminate'}
            </Button>
          </td>
          <td>
            <Button
              onClick={this.__updateClassStudent.bind(this, classId, node.id, null, !node.isAdvanced)}>
                {node.isAdvanced ? 'Restore': 'Advance'}
            </Button>
          </td>
        </tr>
      );
    });
  }
  render() {
    const viewer = this.props.main.viewer;
    if (viewer == null) {
      return (
        <div>Can not load data</div>
      )
    }
    return (
      <Panel>
        <Panel.Body>
          Students:
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Joined</th>
                <th>Eleminated</th>
                <th>Advanced</th>
                <th>Eleminate</th>
                <th>Advance</th>
              </tr>
            </thead>
            <tbody>
              {this.__renderStudents(viewer.class.id)}
            </tbody>
          </Table>
        </Panel.Body>
      </Panel>
    );
  }
}

export default createFragmentContainer(
    MentorToolsContainer,
    {
      main: graphql`
        fragment MentorToolsContainer_main on Main @argumentDefinitions(
          id: { type: "ID!" }
        ) {
          viewer {
            class(id:$id) {
              id
              students(
                first: 100
              ) @connection(key: "MentorToolsesContainer_students") {
                edges {
                  node {
                    id
                    createdAt
                    student {
                      id
                      name
                    }
                    isEleminated
                    isAdvanced
                  }
                }
              }
            }
          }
        }`,
    }
);