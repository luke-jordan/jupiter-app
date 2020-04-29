export const namespace = 'FRIENDS';

export const UPDATE_FRIEND_ALERT_PENDING = `${namespace}/UPDATE_FRIEND_ALERT_PENDING`;
export const UPDATE_FRIEND_LIST = `${namespace}/UPDATE_FRIEND_LIST`;
export const UPDATE_FRIEND_REQUEST_LIST = `${namespace}/UPDATE_FRIEND_REQUEST_LIST`;
export const UPDATE_REFERRAL_DATA = `${namespace}/UPDATE_REFERRAL_DATA`;

export const updateFriendAlertPending = isPending => ({
  type: UPDATE_FRIEND_ALERT_PENDING,
  isPending,
});

export const updateFriendList = friendList => ({
  type: UPDATE_FRIEND_LIST,
  friendList,
});

export const updateFriendReqList = friendRequestList => ({
  type: UPDATE_FRIEND_REQUEST_LIST,
  friendRequestList,
});

export const updateReferralData = payload => ({
  type: UPDATE_REFERRAL_DATA,
  payload,
})