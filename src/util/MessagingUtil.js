import { Endpoints } from '../util/Values';
import { AsyncStorage } from 'react-native';

export const MessagingUtil = {

  setGameId(id) {
    AsyncStorage.setItem('gameId', JSON.stringify(id));
  },

  async getGameId() {
    let info = await AsyncStorage.getItem('gameId');
    if (!info) {
      return false;
    } else {
      return JSON.parse(info);
    }
  },

  setGames(games) {
    AsyncStorage.setItem('currentGames', JSON.stringify(games));
  },

  async getGame(gameId) {
    let info = await AsyncStorage.getItem('currentGames');
    if (!info) {
      return false;
    } else {
      let games = JSON.parse(info);
      for (let game of games) {
        if (game.messageId == gameId) {
          return game;
        }
      }
    }
    return false;
  },

  async fetchMessagesAndGetTop(authenticationToken) {
    try {
      let result = await fetch(Endpoints.CORE + 'message/fetch?gameDryRun=true', {
      // let result = await fetch(Endpoints.CORE + 'message/fetch', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + authenticationToken,
        },
        method: 'GET',
      });
      if (result.ok) {
        let resultJson = await result.json();
        // console.log("resultJson:", resultJson);
        //TODO if game - handle it, return it as displayable data?
        //if normal message - return it

        MessagingUtil.setGameId(resultJson.messagesToDisplay[0].messageId);
        MessagingUtil.setGames(resultJson.messagesToDisplay);
        return resultJson.messagesToDisplay[0];
      } else {
        let resultText = await result.text();
        console.log("resultText:", resultText);
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
    }
  }

}
