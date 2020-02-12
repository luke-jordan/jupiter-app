import { Endpoints } from '../util/Values';
import { FALLBACK_MSG_ID } from '../modules/boost/boost.reducer';

export const MessagingUtil = {

  getFallbackMessage() {
    return {
      messageId: FALLBACK_MSG_ID,
      display: {
        type: 'CARD',
        titleType: 'EMPHASIS',
      },
      actionToTake: 'ADD_CASH',
      title: 'Add money, earn interest',
      body: 'Once you add money in your Jupiter account, you start earning interest immediately. From your very first R1, straight up earnings',
    }
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
        const { messagesToDisplay } = await result.json();
        if (!Array.isArray(messagesToDisplay) || messagesToDisplay.length === 0) {
          return { availableMessages: {}, messageSequence: [] };
        }
        const messageSequence = messagesToDisplay.map((msg) => msg.messageId);
        const availableMessages = messagesToDisplay.reduce((obj, message) => ({ ...obj, [message.messageId]: message }), {});
        return { messageSequence, availableMessages };
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Error fetching messages for user!', JSON.stringify(error));
    }
  },

  async fetchInstructionsMessage(authenticationToken, instructionId) {
    try {
      const result = await fetch(
        `${Endpoints.CORE}message/fetch?instructionId=${instructionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${authenticationToken}`,
          },
          method: 'GET',
        }
      );
      if (result.ok) {
        const resultJson = await result.json();
        return resultJson;
      } else {
        throw result;
      }
    } catch (error) {
      console.error('Error fetching messages for user!', JSON.stringify(error));
    }
  },

  async tellServerMessageAction(userAction, messageId, authenticationToken) {
    if (!messageId || messageId === FALLBACK_MSG_ID) {
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
          body: JSON.stringify({ messageId, userAction }),
        });
        if (result.ok) {
          return true;
        } else {
          throw result;
        }
      } catch (error) {
        console.log('Error sending message process!', JSON.stringify(error));
        return false;
      }
    }
  },

  async sendTapGameResults(taps, authenticationToken) {
    const gameId = await MessagingUtil.getNextMessageId();
    const game = await MessagingUtil.getMessage(gameId);
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
