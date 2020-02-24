import { UPDATE_BOOST_COUNT, UPDATE_BOOST_VIEWED, UPDATE_MESSAGE_VIEWED, UPDATE_MESSAGES_AVAILABLE, UPDATE_MESSAGE_SEQUENCE } from './boost.actions';

const initialState = {
  boostCount: 0,
  boostsViewed: {},
  availableMessages: {},
  messageSequence: [],
  messagesViewed: [],
};

export const STATE_KEY = 'boost';
export const FALLBACK_MSG_ID = 'FALLBACK_DEFAULT';

const boostReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_BOOST_COUNT: {
      return {
        ...state,
        boostCount: action.payload,
      };
    }
    case UPDATE_BOOST_VIEWED: {
      const { boostId, viewedStatus } = action.payload;
      const updatedViewed = state.boostsViewed || {};
      if (Array.isArray(updatedViewed[boostId])) {
        updatedViewed[boostId].push(viewedStatus);
      } else {
        updatedViewed[boostId] = [viewedStatus];
      }
      return {
        ...state,
        boostsViewed: updatedViewed,
      }
    }
    case UPDATE_MESSAGES_AVAILABLE: {
      return {
        ...state,
        availableMessages: action.payload,
      };
    }
    case UPDATE_MESSAGE_SEQUENCE: {
      return {
        ...state,
        messageSequence: action.payload,
      }
    }
    case UPDATE_MESSAGE_VIEWED: {
      const newMsgsViewed = [...state.messagesViewed, action.payload.messageId];
      return {
        ...state,
        messagesViewed: newMsgsViewed,
      }
    }
    default: {
      return state;
    }
  }
};

export const getHasBoostsAvailable = state => state[STATE_KEY].boostCount > 0;

export const getViewedBoosts = state => state[STATE_KEY].boostsViewed;

export const hasViewedFallback = state => state[STATE_KEY].messagesViewed.includes(FALLBACK_MSG_ID);

export const getViewedMessages = state => state[STATE_KEY].messagesViewed;

export const getAvailableMessages = (state) => state[STATE_KEY].availableMessages;

export const getNextMessage = state => {
  const { availableMessages, messageSequence, messagesViewed } = state[STATE_KEY];
  if (Object.keys(availableMessages).length === 0) {
    return null;
  }

  // if we have a message sequence, use it, else default to order of keys
  const idSequence = messageSequence.length > 0 ? messageSequence : Object.keys(availableMessages);

  const messageId = idSequence.find((id) => !messagesViewed.includes(id));

  if (messageId) {
    return availableMessages[messageId];
  }

  return null;
};

export default boostReducer;
