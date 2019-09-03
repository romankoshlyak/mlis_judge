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
    this.subscriptionClient.onDisconnected(() => {
      for (const entry of Object.values(this.subscriptionClient.operations)) {
        entry.handler([new DisconnectedError('Connection to server lost')], null);
      }
    })
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