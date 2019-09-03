import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ConnectionHandler, RecordSourceSelectorProxy, Environment } from 'relay-runtime';

import { AddProblemMutation } from './__generated__/AddProblemMutation.graphql';

const mutation = graphql`
  mutation AddProblemMutation($input: AddProblemInput!) {
    adminAddProblem(input:$input) {
      problemEdge {
        node {
          id
          text
        }
      }
    }
  }
`;

function sharedUpdater(store: RecordSourceSelectorProxy, newEdge: any) {
  let conn = ConnectionHandler.getConnection(
    store.getRoot().getLinkedRecord('admin')!.getLinkedRecord('viewer')!,
    'AdminProblemList_problems',
  );
  ConnectionHandler.insertEdgeAfter(conn!, newEdge);
}

let tempID = 0;

function commit(
  environment: Environment,
  text: string
) {
  return commitMutation<AddProblemMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {
          text,
          clientMutationId: (tempID++).toString(),
        },
      },
      updater: (store) => {
        const payload = store.getRootField('adminAddProblem');
        const newEdge = payload!.getLinkedRecord('problemEdge');
        sharedUpdater(store, newEdge);
      },
      optimisticUpdater: (store) => {
        const id = 'client:newProblem:' + tempID++;
        const node = store.create(id, 'Problem');
        node.setValue(text, 'text');
        node.setValue(id, 'id');
        const newEdge = store.create(
          'client:newEdge:' + tempID++,
          'ProblemEdge',
        );
        newEdge.setLinkedRecord(node, 'node');
        sharedUpdater(store, newEdge);
      },
    }
  );
}

export default {commit};
