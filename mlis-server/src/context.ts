import { PubSub } from 'graphql-subscriptions';
import models, { User } from './models';

export interface ConnectionContext {
  state: {
    authorization: string | null
  }
};
export default interface AppContext {
  models: typeof models,
  viewer: User | null,
  pubsub: PubSub,
  connection: {
    context: ConnectionContext
  } | null
};