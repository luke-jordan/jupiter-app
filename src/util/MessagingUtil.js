import { AsyncStorage } from 'react-native';

import { Endpoints } from '../util/Values';

export const MessagingUtil = {
  setGameId(id) {
    AsyncStorage.setItem('gameId', JSON.stringify(id));
  },

  async getGameId() {
    const info = await AsyncStorage.getItem('gameId');
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
    const info = await AsyncStorage.getItem('currentGames');
    if (!info) {
      return false;
    } else {
      const games = JSON.parse(info);
      for (const game of games) {
        if (game.messageId === gameId) {
          return game;
        }
      }
    }
    return false;
  },

  getFallbackMessage() {
    return {
      display: {
        type: 'CARD',
        titleType: 'EMPHASIS',
      },
      actionToTake: 'ADD_CASH',
      title: 'Add money, earn interest',
      body: 'Once you add money in your Jupiter account, you start earning interest immediately. From your very first R1, straight up earnings',
    }
  },

  async setMessageToDisplay(messageFetchResult) {
    if (
      Array.isArray(messageFetchResult.messagesToDisplay) &&
      messageFetchResult.messagesToDisplay.length > 0
    ) {
      MessagingUtil.setGameId(messageFetchResult.messagesToDisplay[0].messageId);
      MessagingUtil.setGames(messageFetchResult.messagesToDisplay);
      return messageFetchResult.messagesToDisplay[0];
    }

    return this.getFallbackMessage();
  },

  async fetchMessagesAndGetTop(authenticationToken) {
    try {
      const result = await fetch(`${Endpoints.CORE}message/fetch`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${authenticationToken}`,
        },
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        // console.log("resultJson:", resultJson);
        return this.setMessageToDisplay(resultJson);
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Error fetching messages for user!', JSON.stringify(error));
    }
  },

  async dismissedGame(authenticationToken) {
    const gameId = await MessagingUtil.getGameId();
    if (!gameId) {
      return false;
    } else {
      try {
        const result = await fetch(`${Endpoints.CORE}message/process`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${authenticationToken}`,
          },
          method: 'POST',
          body: JSON.stringify({
            messageId: gameId,
            userAction: 'DISMISSED',
          }),
        });
        if (result.ok) {
          const resultJson = await result.json();
          // console.log("resultJson:", resultJson);
          if (resultJson.result.includes('SUCCESS')) {
            AsyncStorage.removeItem('gameId');
            AsyncStorage.removeItem('currentGames');
            return true;
          } else {
            return false;
          }
        } else {
          throw result;
        }
      } catch (error) {
        console.log('Error sending message process!', JSON.stringify(error));
      }
    }
  },

  async sendTapGameResults(taps, authenticationToken) {
    const gameId = await MessagingUtil.getGameId();
    const game = await MessagingUtil.getGame(gameId);
    if (!gameId || !game) {
      return false;
    } else {
      try {
        const result = await fetch(`${Endpoints.CORE}boost/respond`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${authenticationToken}`,
          },
          method: 'POST',
          body: JSON.stringify({
            boostId: game.actionContext.boostId,
            screenClicks: taps,
          }),
        });
        if (result.ok) {
          const resultJson = await result.json();
          // console.log("resultJson:", resultJson);
          if (resultJson.result.includes('SUCCESS')) {
            return true;
          } else {
            return false;
          }
        } else {
          throw result;
        }
      } catch (error) {
        console.log('Error sending game results!', JSON.stringify(error));
      }
    }
  },
};
