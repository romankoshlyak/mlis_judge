import { commitMutation } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { ConnectionHandler, RecordSourceSelectorProxy, Environment } from 'relay-runtime';

import { SubmitMutation } from './__generated__/SubmitMutation.graphql';

const mutation = graphql`
  mutation SubmitMutation($input: SubmitInput!) {
    submit(input:$input) {
      submissionEdge {
        node {
          ...ProblemSubmissionListItem_submission
        }
      }
    }
  }
`;

function sharedUpdater(problemId: string, store: RecordSourceSelectorProxy, newEdge: any) {
  let conn = ConnectionHandler.getConnection(
    store.get(problemId)!,
    'ProblemSubmissionList_submissions',
  );
  ConnectionHandler.insertEdgeAfter(conn!, newEdge);
}

let tempID = 0;

function commit(
  environment: Environment,
  problemId: string,
  submissionCode: string
) {
  return commitMutation<SubmitMutation>(
    environment,
    {
      mutation,
      variables: {
        input: {
          problemId,
          submissionCode,
          testSetId: 'VGVzdFNldDox',
          clientMutationId: (tempID++).toString(),
        },
      },
      updater: (store) => {
        const payload = store.getRootField('submit');
        const newEdge = payload!.getLinkedRecord('submissionEdge');
        sharedUpdater(problemId, store, newEdge);
      },
      /*
      optimisticUpdater: (store) => {
        const id = `client:problem:${problemId}:submission:${tempID++}`;
        const node = store.create(id, 'Submission');
        node.setValue(submissionCode, 'code');
        node.setValue(id, 'id');
        const newEdge = store.create(
          'client:newEdge:' + tempID++,
          'SubmissionEdge',
        );
        newEdge.setLinkedRecord(node, 'node');
        sharedUpdater(problemId, store, newEdge);
      },
      */
    }
  );
}

export default {commit};
