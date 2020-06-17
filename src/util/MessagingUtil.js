import { Endpoints } from '../util/Values';

const WELCOME_MESSAGE = {
  messageId: 'WELCOME_MESSAGE',
  display: {
    type: 'CARD',
    iconType: 'BOOST_ROCKET',
    titleType: 'EMPHASIS',
  },
  actionToTake: 'ADD_CASH',
  title: 'Welcome to your Jupiter app🥳',
  body: 'Hey there, glad to see you here in your Jupiter App! See that big spinning wheel in the centre of your screen? We call that your "Jupiter MoneyWheel". It works hard for you every moment of every day - spinning to earn you interest on your savings with every turn!\n\nSo have a look around your App, and when you\'re ready, make your first save to your MoneyWheel by tapping the PURPLE PLUS button below - and you might also unlock your first boost or game!',
};

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
      messageId: 'VIEW_PROFILE',
      display: {
        type: 'CARD',
      },
      actionToTake: 'VIEW_PROFILE',
      title: 'Complete your Jupiter Profile 👨‍🎨',
      body: 'You can now edit your details on your Jupiter profile in the Profile section of your Jupiter App (or click the button below to do it now)! Let us know the nickname you prefer 😊 And add your cell number or email address to ensure you never miss any Boost, Tournament or article ever again!',
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

    {
      messageId: 'SEE_PAST_MESSAGES',
      display: {
        type: 'CARD',
      },
      actionToTake: 'VISIT_MESSAGES',
      title: 'Tired of missing messages from us? 💌',
      body: 'Feel like you don\'t have time to read messages from the Jupiter team when we send them? We get it, everyone is super busy! So we\'ll store the most important messages in your own Messages section (click the button to check it out now)',
    },

    { 
      messageId: 'CANCEL_SAVES',
      display: {
        type: 'CARD',
      },
      actionToTake: 'VIEW_HISTORY',
      title: 'How to cancel a pending save in your MoneyWheel ⏳',
      body: `You can clear the pending save by 1) touching the Green plus icon in your MoneyWheel. Then, in your History screen 2) click the clock icon of your pending save - and finally 3) click the "Cancel Save" button. It's as easy as 1,2,3 😊`,
    },

]

const FALLBACK_MSG_IDS = FALLBACK_MESSAGES.map((msg) => msg.messageId);

export const MessagingUtil = {

  // may make more sophisticated in future
  getWelcomeMessage() {
    return WELCOME_MESSAGE;
  },

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
    if (!messageId || FALLBACK_MSG_IDS.includes(messageId) || messageId === 'WELCOME_MESSAGE') {
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
