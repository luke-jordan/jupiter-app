import * as Amplitude from 'expo-analytics-amplitude';
import * as Sentry from 'sentry-expo';
import { Endpoints } from '../util/Values';

export const LoggingUtil = {
  initialize() {
    Amplitude.initialize(Endpoints.AMPLITUDE);
    LoggingUtil.logEvent('USER_OPENED_APP');
  },

  setUserId(id) {
    Amplitude.setUserId(id);
  },

  logEvent(event, properties) {
    if (properties) {
      Amplitude.logEventWithProperties(event, properties);
    } else {
      Amplitude.logEvent(event);
    }
  },

  logError(error) {
    Sentry.captureException(error);
  },

  clearUserProperties() {
    Amplitude.clearUserProperties();
  },
};
