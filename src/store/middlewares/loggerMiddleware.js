import { createLogger } from 'redux-logger';

const isDebuggingInChrome = __DEV__ && Boolean(window.navigator.userAgent);

const loggerMiddleware = createLogger({
  predicate: () => isDebuggingInChrome,
  collapsed: true,
  duration: true,
});

export default loggerMiddleware;
