import * as React from 'react';
import { createFragmentContainer, RelayProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';

import { Viewer_viewer } from './__generated__/Viewer_viewer.graphql';
import { Navbar, NavItem, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoutMutation from '../mutations/LogoutMutation';

interface Props {
  relay: RelayProp
  viewer: Viewer_viewer
  onLogout: any
}

class Viewer extends React.Component<Props> {
  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">MLIS</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem>
              {this.props.viewer.user.name}
            </NavItem>
            <NavItem onClick={() => {
                    LogoutMutation.commit(
                      this.props.onLogout
                    );
                  }}>
              Logout
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default createFragmentContainer(Viewer, {
  viewer: graphql`
    fragment Viewer_viewer on Viewer {
      user {
        name
      }
    }
  `,
});