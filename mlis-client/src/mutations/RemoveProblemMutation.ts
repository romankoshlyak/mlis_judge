import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ConnectionHandler, Environment, RecordSourceSelectorProxy } from 'relay-runtime';
import { RemoveProblemMutation } from './__generated__/RemoveProblemMutation.graphql';

const mutation = graphql`
  mutation RemoveProblemMutation($input: RemoveProblemInput!) {
    adminRemoveProblem(input: $input) {
      removedProblemId,
    }
  }
`;

function sharedUpdater(store: RecordSourceSelectorProxy, deletedID: string) {
  let conn = ConnectionHandler.getConnection(
    store.getRoot()!.getLinkedRecord('admin')!.getLinkedRecord('viewer')!,
    'AdminProblemList_problems',
  );
  ConnectionHandler.deleteNode(
    conn!,
    deletedID,
  );
}

function commit(
  environment: Environment,
  problemId: string,
) {
  return commitMutation<RemoveProblemMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {id: problemId},
      },
      updater: (store) => {
        const payload = store.getRootField('adminRemoveProblem');
        const removedProblemId = payload!.getValue('removedProblemId') as string;
        sharedUpdater(store, removedProblemId);
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, problemId);
      },
    }
  );
}

export default {commit};
