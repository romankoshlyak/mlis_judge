import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { Environment } from 'relay-runtime';

import { AdminProblemListItem_problem } from './../components/__generated__/AdminProblemListItem_problem.graphql';
import { ChangeProblemMutation } from './__generated__/ChangeProblemMutation.graphql';

const mutation = graphql`
  mutation ChangeProblemMutation($input: ChangeProblemInput!) {
    adminChangeProblem(input:$input) {
      problem {
        id
        text
      }
    }
  }
`;

function getOptimisticResponse(text: string, problem: AdminProblemListItem_problem) {
  return {
    adminChangeProblem: {
      problem: {
        id: problem.id,
        text: text,
      },
    },
  };
}

function commit(
  environment: Environment,
  text: string,
  problem: AdminProblemListItem_problem,
) {
  return commitMutation<ChangeProblemMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {text, id: problem.id},
      },
      optimisticResponse: getOptimisticResponse(text, problem),
    }
  );
}

export default {commit};
