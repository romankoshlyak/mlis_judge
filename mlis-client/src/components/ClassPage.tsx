import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import ClassContainer from './ClassContainer';
import { ClassPageQuery } from './__generated__/ClassPageQuery.graphql';

const classPageQuery = graphql`
  query ClassPageQuery($id: ID!) {
    main {
      ...ClassContainer_main @arguments(id: $id)
    }
  }
`;
interface Props {
  id: string,
}
class ClassPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<ClassPageQuery>
        environment={environment}
        query={classPageQuery}
        variables={{id:this.props.id}}
        render={({error, props}) => {
          if (props && props.main) {
            return <ClassContainer main={props.main} />;
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

export default ({ match }: any) => <ClassPage id={match.params.id} />
