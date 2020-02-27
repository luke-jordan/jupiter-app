import { Endpoints } from '../util/Values';

const FALLBACK_MESSAGES = [

    {
      messageId: 'ADD_MONEY_ADD_INTEREST',
      display: {
        type: 'CARD',
        iconType: 'UNLOCKED',
      },
      actionToTake: 'ADD_CASH',
      title: 'Add money, earn interest',
      body: 'Once you add money in your Jupiter account, you start earning distributions (what banks call interest) immediately. From your very first R1, straight up earnings',
    },
  
    {
      messageId: 'GET_REWARDED_FOR_SAVING',
      display: {
        type: 'CARD',
        iconType: 'BOOST_ROCKET',
        titleType: 'EMPHASIS',
      },
      actionToTake: 'VIEW_BOOSTS',
      title: 'Get rewarded for saving',
      body: 'Jupiter exists to help you build good saving habits and stuff. We offer boosts all the time to help you save more. Just check back in regularly to see available boosts',
    },

    {
      messageId: 'SEE_YOUR_HISTORY',
      display: {
        type: 'CARD',
      },
      actionToTake: 'VIEW_HISTORY',
      title: 'See your earnings accumulate',
      body: 'Jupiter allows you to see all the activity on your account, whenever you want -- and to see just how much you\'ve earned. Just head to the history screen!',
    },

]

const FALLBACK_MSG_IDS = FALLBACK_MESSAGES.map((msg) => msg.messageId);

export const MessagingUtil = {

  getFallbackMessages() {
    return FALLBACK_MESSAGES;
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
    if (!messageId || FALLBACK_MSG_IDS.includes(messageId)) {
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
  
};
