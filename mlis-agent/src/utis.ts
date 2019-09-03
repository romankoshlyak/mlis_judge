import { Observable } from 'subscriptions-transport-ws';

export async function observeOne<T>(observable: Observable<T>) {
  return new Promise<T>(function(resolve, reject) {
    let resolved = false;
    let observer = {
      next(v: T) {
        resolved = true;
        subscription.unsubscribe();
        resolve(v);
      },
      
      error(e: Error) { 
        resolved = false;
        subscription.unsubscribe();
        reject(e);
      },
      
      complete() {
        if (!resolved) {
          reject(Error('No item found'));
        }
      },
    };
    const subscription = observable.subscribe(observer);
  });
};

export async function*toAsyncIterator<T>(observable: Observable<T>) {
  function promiseCapability() {
      const x:any = {};
      x.promise = new Promise((a, b) => {
          x.resolve = a;
          x.reject = b;
      });
      return x;
  }
  let observer = {
    _buffer: [promiseCapability()],
    _done: false,

    next(v: T) {
      this._buffer[this._buffer.length - 1].resolve(v);
      this._buffer.push(promiseCapability());
    },
    
    error(e: Error) { 
      this._buffer[this._buffer.length - 1].reject(e);
      this._buffer.push(promiseCapability());
      this._done = true;
    },
    
    complete() {
      this._buffer[this._buffer.length - 1].resolve(null);
      this._done = true;
    },
  };
  
  const subscription = observable.subscribe(observer);

    try {
      while (true) {
        let value = await observer._buffer[0].promise
        observer._buffer.shift();
        
        if (observer._buffer.length === 0 && observer._done)
          return;

        yield value;
      }
        
    } finally {
      subscription.unsubscribe();
    }
};

export function assertTrue(x:boolean) {
  if (!x) {
    throw Error("Expected true");
  }
}

export async function awaitOne(x:any) {
  let resultsCount = 0;
  let result = null;
  for await (result of x) {
    if (++resultsCount > 1) {
      throw Error('Expect only one result');
    }
  }
  assertTrue(resultsCount == 1);
  return result;
}