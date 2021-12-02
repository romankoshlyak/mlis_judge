import ws from 'ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

export class DisconnectedError extends Error {
  constructor(m: string) {
      super(m);
      Object.setPrototypeOf(this, DisconnectedError.prototype);
  }
}
export default class AgentEnvironment {
  private subscriptionClient: SubscriptionClient;
  private constructor(url: string) {
    this.subscriptionClient = new SubscriptionClient(url, {}, ws);
    this.subscriptionClient.onConnected(() => {
      console.log('connected');
    });
    this.subscriptionClient.onConnecting(() => {
      console.log('connecting');
    });
    this.subscriptionClient.onDisconnected(() => {
      console.log('disconected');
    });
    this.subscriptionClient.onReconnected(() => {
      console.log('reconnected');
    });
    this.subscriptionClient.onReconnecting(() => {
      console.log('reconnecting');
    });
    this.subscriptionClient.onError((err) => {
      console.log('error');
    });
    this.subscriptionClient.onDisconnected(() => {
      for (const entry of Object.values(this.subscriptionClient.operations)) {
        entry.handler([new DisconnectedError('Connection to server lost')], null);
      }
    });
  }
  public static createNew(url: string) {
    return new AgentEnvironment(url);
  }

  public request(query: any, variables: any) {
    return this.subscriptionClient.request({query, variables});
  }
 
  public dispose() {
    this.subscriptionClient.close(true, true);
  }
}