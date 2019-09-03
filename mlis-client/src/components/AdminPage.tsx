import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import AdminContainer from './AdminContainer';
import { AdminPageQuery } from './__generated__/AdminPageQuery.graphql';

const adminPageQuery = graphql`
  query AdminPageQuery {
    admin {
      ...AdminContainer_admin
    }  
  }
`;
const AdminPage: React.FC = () => {
  return (
    <QueryRenderer<AdminPageQuery>
      environment={environment}
      query={adminPageQuery}
      variables={{}}
      render={({error, props}) => {
        if (props && props.admin) {
          return <AdminContainer admin={props.admin} />;
        } else if (props || error) {
          console.error(`Unexpected data: ${JSON.stringify(props || error)}`)
        } else {
          return <div>Loading</div>;
        }
      }}
    />
  );
}

export default AdminPage;
