import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import { AUTHORIZATION } from './../constants'

import { AuthType, LoginMutation } from './__generated__/LoginMutation.graphql'

const mutation = graphql`
  mutation LoginMutation($input: LoginInput!) {
    login(input:$input) {
      authorization
    }
  }
`;

function commit(
  authType: AuthType,
  token: string,
  onCompleted: any,
) {
  return commitMutation<LoginMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {
          authType,
          token,
        }
      },
      onCompleted: (response, errors) => {
        if (errors != null) {
          console.log(errors);
        }
        localStorage.setItem(AUTHORIZATION, response.login.authorization);
        onCompleted();
      },
      onError: err => console.error(err),
    }
  );
}

export default {commit};
