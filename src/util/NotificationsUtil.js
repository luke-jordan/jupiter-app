import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints } from '../util/Values';

import { LoggingUtil } from './LoggingUtil';

export const NotificationsUtil = {
  async uploadTokenToServer(notificationsToken, authenticationToken) {
    try {
      const result = await fetch(`${Endpoints.CORE}message/token`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${authenticationToken}`,
        },
        method: 'POST',
        body: JSON.stringify({
          provider: 'EXPO',
          token: notificationsToken,
        }),
      });
      if (result.ok) {
        const resultJson = await result.json();
        if (resultJson.result && resultJson.result.includes('SUCCESS')) {
          return true;
        }
        return false;
      }
      if (!result.ok) {
        throw result;
      }
    } catch (error) {
      return false;
    }
  },

  async handleNotification(navigation, notification) {
    // TODO this fires both on receiving and clicking the notification on Android and probably
    // only once on iOS; we should make sure we are only handling it once
    // console.log(notification);

    try {
      if (notification.origin === 'received') {
        // TODO
        //   if (ios) show in tray
      } else if (notification.origin === 'selected') {
        NavigationUtil.navigateWithoutBackstack(navigation, 'Home');
      }
    } catch (err) {
      // including this because this may be one of the sources of Sentry error
      LoggingUtil.logError(err);
    }
  },

  async deleteNotificationToken(authenticationToken) {
    try {
      // there is a corner case of user being logged into multiple devices, so we specify the token here
      const result = await fetch(`${Endpoints.CORE}'message/token`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${authenticationToken}`,
        },
        method: 'DELETE',
        body: JSON.stringify({
          provider: 'EXPO',
        }),
      });

      if (result.ok) {
        return true;
      }

      return false;
    } catch (err) {
      err.message = `Push notification delete error: ${err.message};`;
      LoggingUtil.logError(err);
      return false;
    }
  },
};
