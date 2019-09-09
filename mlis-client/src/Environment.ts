import {
  FetchFunction,
  SubscribeFunction,
  Environment,
  Network,
  RecordSource,
  Store,
  Observable as RelayObservable
} from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { AUTHORIZATION } from './constants';
import { requireValue } from './utils';

const subscriptionUrl = requireValue(process.env.REACT_APP_GRAPHQL_URL);
const subscriptionClient = new SubscriptionClient(
  subscriptionUrl,
  {
    reconnect: true,
    connectionParams: {
      authorization: localStorage.getItem(AUTHORIZATION)
    }
  }
);
const subscribeFn: SubscribeFunction = function(request, variables) {
  const query = request.text!;
  const observable:any = subscriptionClient.request({ query, variables});
  return RelayObservable.from(observable);
}

const environment = new Environment({
  network: Network.create(subscribeFn as FetchFunction, subscribeFn),
  store: new Store(new RecordSource()),  
});

export default environment;