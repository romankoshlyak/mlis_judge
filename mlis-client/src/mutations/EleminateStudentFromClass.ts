import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { Environment } from 'relay-runtime';

import { EleminateStudentFromClassMutation } from './__generated__/EleminateStudentFromClassMutation.graphql';

const mutation = graphql`
  mutation EleminateStudentFromClassMutation($input: EleminateStudentFromClassInput!) {
    eleminateStudentFromClass(input:$input) {
      student {
        id
        isEleminated
      }
    }
  }
`;

let tempID = 0;
function commit(
  environment: Environment,
  classId: string,
  studentId: string,
  isEleminated: boolean,
) {
  return commitMutation<EleminateStudentFromClassMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {
          classId,
          studentId,
          isEleminated,
          clientMutationId: (tempID++).toString(),
        },
      },
    }
  );
}

export default {commit};
