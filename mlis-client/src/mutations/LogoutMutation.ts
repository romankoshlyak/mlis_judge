import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import { AUTHORIZATION } from './../constants'

import { LogoutMutation } from './__generated__/LogoutMutation.graphql'

const mutation = graphql`
  mutation LogoutMutation($input: LogoutInput!) {
    logout(input:$input) {
      clientMutationId
    }
  }
`;

function commit(
  onCompleted: any,
) {
  return commitMutation<LogoutMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {
        }
      },
      onCompleted: (response, errors) => {
        if (errors != null) {
          console.log(errors);
        }
        localStorage.removeItem(AUTHORIZATION);
        onCompleted();
      },
      onError: err => console.error(err),
    }
  );
}

export default {commit};
