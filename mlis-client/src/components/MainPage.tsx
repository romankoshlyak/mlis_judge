import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import MainContainer from './MainContainer';
import { MainPageQuery } from './__generated__/MainPageQuery.graphql';

const mainPageQuery = graphql`
  query MainPageQuery {
    main {
      ...MainContainer_main
    }  
  }
`;
const MainPage: React.FC = () => {
  return (
    <QueryRenderer<MainPageQuery>
      environment={environment}
      query={mainPageQuery}
      variables={{}}
      render={({error, props}) => {
        if (props && props.main) {
          return <MainContainer main={props.main} />;
        } else if (props || error) {
          console.error(`Unexpected data: ${JSON.stringify(props || error)}`)
        } else {
          return <div>Loading</div>;
        }
      }}
    />
  );
}

export default MainPage;
