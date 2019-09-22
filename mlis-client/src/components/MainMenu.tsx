import * as React from 'react';
import { createFragmentContainer, RelayProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';

import { MainMenu_viewer } from './__generated__/MainMenu_viewer.graphql';
import { Link } from 'react-router-dom';
import LogoutMutation from '../mutations/LogoutMutation';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

interface Props {
  relay: RelayProp
  viewer: MainMenu_viewer
  onLogout: any
}

class MainMenu extends React.Component<Props> {
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
            <LinkContainer to="/classes">
              <NavItem>Classes</NavItem>
            </LinkContainer>
            <LinkContainer to="/ranking">
              <NavItem>Ranking</NavItem>
            </LinkContainer>
            <LinkContainer to={`/user/${this.props.viewer.user.id}`}>
              <NavItem>
                {this.props.viewer.user.name}
              </NavItem>
            </LinkContainer>
            <NavDropdown title="..." id="menu_more">
              <LinkContainer to="/term_of_service">
                <MenuItem>Terms</MenuItem>
              </LinkContainer>
              <LinkContainer to="/privacy_policy">
                <MenuItem>Privacy</MenuItem>
              </LinkContainer>
              <LinkContainer to="/sponsors">
                <MenuItem>Sponsors</MenuItem>
              </LinkContainer>
              <MenuItem divider />
              <MenuItem onClick={LogoutMutation.commit.bind(LogoutMutation, this.props.onLogout)}>Logout</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default createFragmentContainer(MainMenu, {
  viewer: graphql`
    fragment MainMenu_viewer on Viewer {
      user {
        id
        name
      }
    }
  `,
});