import { applyMiddleware, createStore } from 'redux';

import loggerMiddleware from './middlewares/loggerMiddleware';
import { enableHotReload, enableStoreDebug } from './helpers';
import rootReducer from './rootReducer';

export default initialState => {
  const middlewares = [];

  if (__DEV__) {
    // eslint-disable-next-line fp/no-mutating-methods
    middlewares.push(loggerMiddleware);
  }

  // Create enhancer.
  const enhancer = applyMiddleware(...middlewares);
  const store = createStore(rootReducer, initialState, enhancer);
  console.log('Set up store');

  enableStoreDebug(store);
  enableHotReload(store);

  return store;
};
