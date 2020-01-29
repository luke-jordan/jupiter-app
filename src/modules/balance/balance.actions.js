export const namespace = 'BALANCE';

export const UPDATE_SERVER_BALANCE = `${namespace}/UPDATE_BOOST_COUNT`;
export const UPDATE_SHOWN_BALANCE = `${namespace}/UPDATE_SHOWN_BALANCE`

export const updateServerBalance = payload => ({
    type: UPDATE_SERVER_BALANCE,
    payload,
});

export const updateShownBalance = payload => ({
  type: UPDATE_SHOWN_BALANCE,
  payload,
});
