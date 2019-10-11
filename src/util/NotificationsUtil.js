import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints } from '../util/Values';

export const NotificationsUtil = {

  async uploadTokenToServer(notificationsToken, authenticationToken) {
    try {
      let result = await fetch(Endpoints.CORE + 'message/token', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + authenticationToken,
        },
        method: 'POST',
        body: JSON.stringify({
          "provider": "EXPO",
          "token": notificationsToken
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        // console.log(resultJson);
        if (resultJson.result && resultJson.result.includes("SUCCESS")) { //TODO check if this actually includes it
          return true;
        }
        return false;
      } else {
        let resultText = await result.text();
        console.log("resultText:", resultText);
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
      return false;
    }
  },

  async handleNotification(navigation, notification) {
    //TODO this fires both on receiving and clicking the notification on Android and probably
    //only once on iOS; we should make sure we are only handling it once
    // console.log(notification);

    if (notification.origin == "received") {
      //TODO
      //   if (ios) show in tray
    } else if (notification.origin == "selected") {
      NavigationUtil.navigateWithoutBackstack(navigation, 'Home');
    }

  }

};
