import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { Environment } from 'relay-runtime';

import { UpdateClassStudentMutation } from './__generated__/UpdateClassStudentMutation.graphql';

const mutation = graphql`
  mutation UpdateClassStudentMutation($input: UpdateClassStudentInput!) {
    updateClassStudent(input:$input) {
      student {
        id
        isEleminated
        isAdvanced
      }
    }
  }
`;

let tempID = 0;
function commit(
  environment: Environment,
  classId: string,
  studentId: string,
  isEleminated: boolean | null,
  isAdvanced: boolean | null,
) {
  return commitMutation<UpdateClassStudentMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {
          classId,
          studentId,
          isEleminated,
          isAdvanced,
          clientMutationId: (tempID++).toString(),
        },
      },
    }
  );
}

export default {commit};
