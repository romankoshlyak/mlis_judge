import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';

import resolvers from './resolvers';
import typeDefs from './schemas';
import models from './models';
import { ConnectionContext } from './context';
import AppContext from './context';

const pubsub = new PubSub();
export default class AppServer extends ApolloServer {
  private static getSubscriptionsConfig() {
    return {
      onConnect: (connectionParams: any): ConnectionContext => {
        const params: {authorization: string | null} = connectionParams;
        return {
          state: {
            authorization: params.authorization
          }
        };
      },
    };
  }
  private static async getContext(context: any): Promise<AppContext> {
    let token: string | null = null;
    if (context.connection != null) {
      const connectionContext = context.connection.context as ConnectionContext;
      token = connectionContext.state.authorization;
    } else {
      token = context.req.headers.authorization;
    }
    const contextFromToken = await this.getContextFromToken(token);
    return {...contextFromToken, connection: context.connection};
  }

  public static async getContextFromToken(token: string | null) {
    const jwtSecret = process.env.JWT_SECRET || '';
    let viewer = null;
    try {
      if (token != null) {
        const jwtInfo = <{user_id:number}> await jwt.verify(token, jwtSecret);
        viewer = await models.User.findByPk(jwtInfo.user_id);
      }
    } catch (error) {
      console.error(token, error);
    }

    return { models, viewer, pubsub, connection: null };
  }
  private static getConfig() {
    const subscriptions = this.getSubscriptionsConfig();
    const context = this.getContext.bind(this);
    return {
      resolvers,
      typeDefs,
      subscriptions,
      context,
    };
  }
  public constructor() {
    super(AppServer.getConfig());
  }
}