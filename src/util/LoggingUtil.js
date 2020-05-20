import * as Amplitude from 'expo-analytics-amplitude';
import * as Analytics from 'expo-firebase-analytics';
import * as Sentry from 'sentry-expo';

import Constants from 'expo-constants';

import { Endpoints } from '../util/Values';


export const LoggingUtil = {
  initialize() {
    try {
      Amplitude.initialize(Endpoints.AMPLITUDE);
      LoggingUtil.logEvent('USER_OPENED_APP');
    } catch (err) {
      console.log('Error initializing amplitude: ', JSON.stringify(err));
    }
  },

  setUserId(id) {
    try {
      Amplitude.setUserId(id);
      Analytics.setUserId(id);
    } catch (err) {
      console.log('Error setting amplitude user ID: ', JSON.stringify(err));
    }
  },

  logEvent(event, properties) {
    try {
      if (properties) {
        Amplitude.logEventWithProperties(event, properties);
      } else {
        Amplitude.logEvent(event);
      }
      
    } catch (err) {
      console.log('Error logging with Amplitude: ', JSON.stringify(err));
    }
  },

  // a bit painful to make FB channel dependent, and we are only using for ad bidding at present, so we just
  // distinguish projects by namespace
  logFirebaseEvent(eventName, properties) {
    try {
      Analytics.logEvent(`${Constants.manifest.releaseChannel.toUpper()}::${eventName}`, properties);
    } catch (err) {
      try {
        Sentry.captureException(err);
      } catch (sentryErr) {
        console.log('Well, those are some deep errors');
      }
    }
  },

  logError(error) {
    try {
      Sentry.captureException(error);
    } catch (err) {
      console.log('Error logging error!');
    }
  },

  clearUserProperties() {
    try {
      Amplitude.clearUserProperties();
    } catch (err) {
      console.log('Error clearing Amplitude properties: ', err);
    }
  },
};
