import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import MentorToolsContainer from './MentorToolsContainer';
import { MentorToolsPageQuery } from './__generated__/MentorToolsPageQuery.graphql';

const mentorToolsPageQuery = graphql`
  query MentorToolsPageQuery($id: ID!) {
    main {
      ...MentorToolsContainer_main @arguments(id: $id)
    }
  }
`;
interface Props {
  id: string,
}
export default class MentorToolsPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<MentorToolsPageQuery>
        environment={environment}
        query={mentorToolsPageQuery}
        variables={{id:this.props.id}}
        render={({error, props}) => {
          if (props && props.main) {
            return <MentorToolsContainer main={props.main} />;
          } else if (props || error) {
            console.error(`Unexpected data: ${JSON.stringify(props || error)}`)
          } else {
            return <div>Loading</div>;
          }
        }}
      />
    );
  };
}