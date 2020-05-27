export const namespace = 'FRIENDS';

export const UPDATE_HAS_SEEN_FRIENDS = `${namespace}/UPDATE_FRIEND_SEEN`;
export const UPDATE_FRIEND_ALERT = `${namespace}/UPDATE_FRIEND_ALERT_PENDING`;

export const UPDATE_FRIEND_LIST = `${namespace}/UPDATE_FRIEND_LIST`;
export const UPDATE_FRIEND_REQUEST_LIST = `${namespace}/UPDATE_FRIEND_REQUEST_LIST`;
export const UPDATE_REFERRAL_DATA = `${namespace}/UPDATE_REFERRAL_DATA`;
export const UPDATE_FRIEND_SAVING_POOLS = `${namespace}/UPDATE_FRIEND_SAVING_POOLS`;

// since 90% of operations only work on one at a time
export const ADD_FRIENDSHIP = `${namespace}/ADD_FRIENDSHIP`;
export const ADD_FRIEND_REQUEST = `${namespace}/ADD_FRIEND_REQUEST`;
export const ADD_FRIEND_SAVING_POOL = `${namespace}/ADD_FRIEND_SAVING_POOL`;

export const REMOVE_FRIENDSHIP = `${namespace}/REMOVE_FRIENDSHIP`;
export const REMOVE_FRIEND_REQUEST = `${namespace}/REMOVE_FRIEND_REQUEST`;
// will add remove pool when called for

export const updateHasSeenFriends = hasSeenFriends => ({
  type: UPDATE_HAS_SEEN_FRIENDS,
  hasSeenFriends,
});

export const updateFriendAlerts = payload => ({
  type: UPDATE_FRIEND_ALERT,
  payload,
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
});

// using these to save repeated calls to get everything again (may risk some short-term inconsistency, but worth
// trade-off for sparing our users devices -- can adjust in future if necessary)
export const addFriendship = friend => ({
  type: ADD_FRIENDSHIP,
  friend,
});

export const addFriendRequest = friendRequest => ({
  type: ADD_FRIEND_REQUEST,
  friendRequest,
})

export const removeFriendship = relationshipId => ({
  type: REMOVE_FRIENDSHIP,
  relationshipId,
});


export const removeFriendRequest = friendRequestId => ({
  type: REMOVE_FRIEND_REQUEST,
  friendRequestId,
});

// and now for friend saving pools
export const addSavingPool = savingPool => ({
  type: ADD_FRIEND_SAVING_POOL,
  savingPool,
});

export const updateSavingPools = savingPools => ({
  type: UPDATE_FRIEND_SAVING_POOLS,
  savingPools,
});
