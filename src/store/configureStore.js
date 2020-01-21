import { applyMiddleware, createStore } from 'redux';

import loggerMiddleware from './middlewares/loggerMiddleware';
import { enableHotReload, enableStoreDebug } from './helpers';
import rootReducer from './rootReducer';

export default initialState => {
  const middlewares = [];

  if (__DEV__) {
    middlewares.push(loggerMiddleware);
  }

  // Create enhancer.
  const enhancer = applyMiddleware(...middlewares);
  const store = createStore(rootReducer, initialState, enhancer);
 
  enableStoreDebug(store);
  enableHotReload(store);

  return store;
};
