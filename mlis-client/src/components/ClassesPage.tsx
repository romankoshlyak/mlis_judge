import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import ClassesContainer from './ClassesContainer';
import { ClassesPageQuery } from './__generated__/ClassesPageQuery.graphql';

const classesPageQuery = graphql`
  query ClassesPageQuery {
    main {
      ...ClassesContainer_main
    }  
  }
`;
interface Props {
}
export default class ClassesPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<ClassesPageQuery>
        environment={environment}
        query={classesPageQuery}
        variables={{}}
        render={({error, props}) => {
          if (props && props.main) {
            return <ClassesContainer main={props.main} />;
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