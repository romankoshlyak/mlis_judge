import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import SponsorsContainer from './SponsorsContainer';
import { SponsorsPageQuery } from './__generated__/SponsorsPageQuery.graphql';

const sponsorsPageQuery = graphql`
  query SponsorsPageQuery {
    main {
      ...SponsorsContainer_main
    }  
  }
`;
interface Props {
}
export default class RankingPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<SponsorsPageQuery>
        environment={environment}
        query={sponsorsPageQuery}
        variables={{}}
        render={({error, props}) => {
          if (props && props.main) {
            return <SponsorsContainer main={props.main} />;
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