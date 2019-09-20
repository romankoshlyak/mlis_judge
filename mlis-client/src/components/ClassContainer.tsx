import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ClassContainer_main } from './__generated__/ClassContainer_main.graphql';
import Authorized from './Authorized';
import Panel from 'react-bootstrap/lib/Panel';
import { Link } from 'react-router-dom';
import { viewerIsClassMentor, viewerCanAccessClass } from '../utils';
import { FacebookProvider, Comments } from 'react-facebook';

interface Props {
  relay: RelayRefetchProp,
  main: ClassContainer_main,
}

class ClassContainer extends React.Component<Props> {
  renderMentorTool() {
    return (
      <div>TODO</div>
    )
  }
  renderClass() {
    if (this.props.main.viewer == null) {
      return null;
    }
    const viewer = this.props.main.viewer;
    const viewerIsMentor = viewerIsClassMentor(viewer, viewer.class);
    const viewerCanAccess = viewerCanAccessClass(viewer, viewer.class);
    let body = null;
    if (viewerCanAccess) {
      body = (
        <div>
          Mentor: <Link to={`/user/${viewer.class.mentor.id}`}>{viewer.class.mentor.name}</Link>
        </div>
      );
    } else if (viewer.class.viewerIsEleminated) {
      body = (
        <div>
          You have been eleminated from a class, most lickly you missed task deadline
        </div>
      );
    } else if (!viewer.class.viewerIsApplied) {
      body = (
        <div>
          You not in the class, you can apply for classes <Link to='/classes'>here</Link>
        </div>
      );
    }
    let mentorTools = null;
    if (viewerIsMentor) {
      mentorTools = (
        <Panel>
          <Panel.Heading>
            <Panel.Title>
              <Panel.Toggle>
                Open mentor tools
              </Panel.Toggle>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            {this.renderMentorTool.bind(this)()}
          </Panel.Collapse>
        </Panel>
      )
    }
    return (
      <Panel>
        <Panel.Body>
          <h1>MLIS Class {new Date(viewer.class.startAt).toLocaleDateString()}</h1>
          <h2>{viewer.class.name}</h2>
          {body}
          {mentorTools}
          <FacebookProvider appId={process.env.REACT_APP_FB_APP_ID}>
            <Comments href={window.location.href.split('?')[0]} width="100%" />
          </FacebookProvider>
        </Panel.Body>
      </Panel>
    );
  }
  render() {
    return (
      <Authorized main={this.props.main} mainRelay={this.props.relay}>
        {this.renderClass()}
      </Authorized>
    );
  }
}

export default createRefetchContainer(
    ClassContainer,
    {
      main: graphql`
        fragment ClassContainer_main on Main @argumentDefinitions(
          id: { type: "ID!" }
        ) {
          ...Authorized_main
          viewer {
            user {
              id
            }
            class(id:$id) {
              startAt
              name
              mentor {
                id
                name
              }
              viewerIsApplied
              viewerIsEleminated
            }
          }
        }`,
    },
    graphql`
      query ClassContainerQuery($id: ID!) {
        main {
          ...ProblemContainer_main @arguments(id: $id)
        }
      }`
);