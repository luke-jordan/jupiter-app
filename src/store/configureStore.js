import { applyMiddleware, createStore } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import { AsyncStorage } from 'react-native';

import loggerMiddleware from './middlewares/loggerMiddleware';
import { enableHotReload, enableStoreDebug } from './helpers';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default initialState => {
  const middlewares = [];

  if (__DEV__) {
    // eslint-disable-next-line fp/no-mutating-methods
    middlewares.push(loggerMiddleware);
  }

  // Create enhancer.
  const enhancer = applyMiddleware(...middlewares);
  const store = createStore(persistedReducer, initialState, enhancer);
  const persistor = persistStore(store);

  console.log('Set up store');

  enableStoreDebug(store);
  enableHotReload(store);

  return { store, persistor };
};
