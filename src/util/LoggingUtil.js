import * as Amplitude from 'expo-analytics-amplitude';
import * as Sentry from 'sentry-expo';

import { Endpoints } from '../util/Values';

const extractContextFromResponse = async (response) => {
  try {
    // console.log('Headers: ', response.headers);
    const bodyParsed = await response.json();
    // console.log('Parsed response body: ', bodyParsed);
    return bodyParsed;
  } catch (err) {
    // console.log('Error parsing response body: ', err);
    // const bodyText = await response.text();
    return JSON.stringify(response);
  }
}

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

  logError(error) {
    try {
      Sentry.captureException(error);
    } catch (err) {
      console.log('Error logging error!');
    }
  },

  async logApiError(calledUrl, response) {
    try {
      if (response && response.status === 401) {
        console.log('Unauthorized error, likely an expired token, do not log, but should logout');
        return;
      }
      
      const safeResponse = await extractContextFromResponse(response);
      // console.log('Decoded body: ', safeResponse);
      const context = {
        status: response.status,
        headers: response.headers,
        body: safeResponse, 
      };
      // adding in the whole thing because not always getting context on Sentry, and some strange 401s coming up
      Sentry.captureException(new Error(`Error calling: ${calledUrl}, response: ${JSON.stringify(response)}`), context);
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
