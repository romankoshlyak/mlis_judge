import AppContext from './../context';

export default async function logout(parent: null, { input }: any, { connection }: AppContext) {
  if (connection != null) {
    connection.context.state.authorization = null;
  }
  return {
    clientMutationId: input.clientMutationId,
  }
}