import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import RankingContainer from './RankingContainer';
import { RankingPageQuery } from './__generated__/RankingPageQuery.graphql';

const classesPageQuery = graphql`
  query RankingPageQuery {
    main {
      ...RankingContainer_main
    }  
  }
`;
interface Props {
}
export default class RankingPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<RankingPageQuery>
        environment={environment}
        query={classesPageQuery}
        variables={{}}
        render={({error, props}) => {
          if (props && props.main) {
            return <RankingContainer main={props.main} />;
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