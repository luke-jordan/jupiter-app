export const enableStoreDebug = store => {
  const isDebuggingInChrome = __DEV__ && Boolean(window.navigator.userAgent);
  if (isDebuggingInChrome) {
    window.store = store;
  }
};

export const enableHotReload = store => {
  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('../rootReducer').default;
      store.replaceReducer(nextRootReducer);
    });
  }
};
