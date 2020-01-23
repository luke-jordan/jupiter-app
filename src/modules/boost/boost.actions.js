export const namespace = 'BOOST';

export const UPDATE_BOOST_COUNT = `${namespace}/UPDATE_BOOST_COUNT`;

export const updateBoostCount = payload => ({
  type: UPDATE_BOOST_COUNT,
  payload,
});
