import * as Amplitude from 'expo-analytics-amplitude';

export const LoggingUtil = {

  initialize() {
    Amplitude.initialize('80b9b8a9b4bf0b6c4bdff7782cf85af2');
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
