
import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import ProblemContainer from './ProblemContainer';
import { ProblemPageQuery } from './__generated__/ProblemPageQuery.graphql';

const problemPageQuery = graphql`
  query ProblemPageQuery($id: ID!) {
    main {
      ...ProblemContainer_main @arguments(id: $id)
    }  
  }
`;
interface Props {
  id: string,
}
class ProblemPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<ProblemPageQuery>
        environment={environment}
        query={problemPageQuery}
        variables={{id:this.props.id}}
        render={({error, props}) => {
          if (props && props.main) {
            return <ProblemContainer main={props.main} />;
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

export default ({ match }: any) => <ProblemPage id={match.params.id} />
