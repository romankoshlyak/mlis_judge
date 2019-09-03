import {
  commitMutation,
} from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import environment from './../Environment';
import { AUTHORIZATION } from './../constants'

import { LoginMutation } from './__generated__/LoginMutation.graphql'

const mutation = graphql`
  mutation LoginMutation($authType: String!, $accessToken: String!) {
    loginOld(authType:$authType, accessToken:$accessToken)
  }
`;

function commit(
  authType: string,
  accessToken: string,
  onCompleted: any,
) {
  return commitMutation<LoginMutation>(
    environment,
    {
      mutation,
      variables: {
        authType,
        accessToken,
      },
      onCompleted: (response, errors) => {
        localStorage.setItem(AUTHORIZATION, response.loginOld);
        onCompleted();
      },
      onError: err => console.error(err),
    }
  );
}

export default {commit};
