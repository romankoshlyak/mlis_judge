import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import UserContainer from './UserContainer';
import { UserPageQuery } from './__generated__/UserPageQuery.graphql';

const userPageQuery = graphql`
  query UserPageQuery {
    main {
      ...UserContainer_main
    }  
  }
`;
interface Props {
  id: string,
}
class UserPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<UserPageQuery>
        environment={environment}
        query={userPageQuery}
        variables={{id:this.props.id}}
        render={({error, props}) => {
          if (props && props.main) {
            return <UserContainer main={props.main} />;
          } else if (props || error) {
            console.error(`Unexpected data: ${JSON.stringify(props || error)}`)
          } else {
            return <div>Loading</div>;
          }
        }}
      />
    );
  }
}

export default ({ match }: any) => <UserPage id={match.params.id} />
