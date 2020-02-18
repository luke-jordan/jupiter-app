export const namespace = 'BOOST';

export const UPDATE_BOOST_COUNT = `${namespace}/UPDATE_BOOST_COUNT`;
export const UPDATE_BOOST_VIEWED = `${namespace}/UPDATE_BOOST_VIEWED`;
export const UPDATE_MESSAGES_AVAILABLE = `${namespace}/UPDATE_MESSAGES_AVAILABLE`;
export const UPDATE_MESSAGE_SEQUENCE = `${namespace}/UPDATE_MESSAGE_SEQUENCE`;
export const UPDATE_MESSAGE_VIEWED = `${namespace}/UPDATE_MESSAGE_VIEWED`;

export const updateBoostCount = payload => ({
  type: UPDATE_BOOST_COUNT,
  payload,
});

export const updateBoostViewed = payload => ({
  type: UPDATE_BOOST_VIEWED,
  payload,
});

export const updateMessagesAvailable = payload => ({
  type: UPDATE_MESSAGES_AVAILABLE,
  payload,
});

export const updateMessageSequence = payload => ({
  type: UPDATE_MESSAGE_SEQUENCE,
  payload,
});

export const updateMessageViewed = payload => ({
  type: UPDATE_MESSAGE_VIEWED,
  payload,
});
