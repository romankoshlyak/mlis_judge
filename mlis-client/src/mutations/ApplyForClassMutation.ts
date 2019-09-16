import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { Environment } from 'relay-runtime';

import { ApplyForClassMutation } from './__generated__/ApplyForClassMutation.graphql';

const mutation = graphql`
  mutation ApplyForClassMutation($input: ApplyForClassInput!) {
    applyForClass(input:$input) {
      class {
        id
        studentsCount
        viewerIsApplied
      }
    }
  }
`;

let tempID = 0;
function commit(
  environment: Environment,
  classId: string,
) {
  return commitMutation<ApplyForClassMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {
          classId,
          clientMutationId: (tempID++).toString(),
        },
      },
    }
  );
}

export default {commit};
