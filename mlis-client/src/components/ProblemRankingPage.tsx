import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import ProblemRankingContainer from './ProblemRankingContainer';
import { ProblemRankingPageQuery } from './__generated__/ProblemRankingPageQuery.graphql';

const problemRankingPageQuery = graphql`
  query ProblemRankingPageQuery($id: ID!) {
    main {
      ...ProblemRankingContainer_main @arguments(id: $id)
    }  
  }
`;
interface Props {
  id: string,
}
class ProblemRankingPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<ProblemRankingPageQuery>
        environment={environment}
        query={problemRankingPageQuery}
        variables={{id:this.props.id}}
        render={({error, props}) => {
          if (props && props.main) {
            return <ProblemRankingContainer main={props.main} />;
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

export default ({ match }: any) => <ProblemRankingPage id={match.params.id} />
