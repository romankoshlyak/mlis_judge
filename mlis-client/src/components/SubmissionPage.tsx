import React from 'react';
import { QueryRenderer } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import SubmissionContainer from './SubmissionContainer';
import { SubmissionPageQuery } from './__generated__/SubmissionPageQuery.graphql';

const submissionPageQuery = graphql`
  query SubmissionPageQuery($id: ID!) {
    main {
      ...SubmissionContainer_main
      viewer {
        submission(id:$id) {
          ...SubmissionContainer_submission
        }
      }
    }  
  }
`;
interface Props {
  id: string,
}
class SubmissionPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer<SubmissionPageQuery>
        environment={environment}
        query={submissionPageQuery}
        variables={{id:this.props.id}}
        render={({error, props}) => {
          if (props && props.main) {
            let submission = null;
            if (props.main.viewer != null) {
              submission = props.main.viewer.submission;
            }
            return <SubmissionContainer main={props.main} submission={submission} />;
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

export default ({ match }: any) => <SubmissionPage id={match.params.id} />