import * as Amplitude from 'expo-analytics-amplitude';
import { Endpoints } from '../util/Values';

export const LoggingUtil = {

  initialize() {
    Amplitude.initialize(Endpoints.AMPLITUDE);
    LoggingUtil.logEvent("USER_OPENED_APP");
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

  clearUserProperties() {
    Amplitude.clearUserProperties();
  }
};
