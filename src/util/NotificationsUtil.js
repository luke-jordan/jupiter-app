import { Endpoints } from './Values';

export const NotificationsUtil = {

  uploadTokenToServer(notificationsToken, authenticationToken) {
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
        if (resultJson.result.includes("SUCCESS")) {
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

  handleNotification(notification) {
    console.log(notification);
    //TODO implement message/fetch and return the result 
  }

};
