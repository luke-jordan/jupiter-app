import {
  UPDATE_FRIEND_LIST,
  UPDATE_FRIEND_ALERT,
  UPDATE_FRIEND_REQUEST_LIST,
  UPDATE_REFERRAL_DATA,
  ADD_FRIENDSHIP,
  ADD_FRIEND_REQUEST,
  REMOVE_FRIENDSHIP,
  REMOVE_FRIEND_REQUEST,
  UPDATE_HAS_SEEN_FRIENDS,
  UPDATE_FRIEND_SAVING_POOLS,
  ADD_FRIEND_SAVING_POOL,
} from './friend.actions';

import { safeAmountStringSplit } from '../../util/AmountUtil';

const initialState = {
  friends: [],
  friendRequests: [],
  friendSavingPools: [],
  referralData: {},
  friendAlertStatus: {}, 
  hasSeenFriendsExists: false, // just to make sure user knows it is there (will wipe on logout)
};

export const STATE_KEY = 'friend';

const safeAddToArray = (oldArray, valueToAdd) => Array.isArray(oldArray) ? [...oldArray, valueToAdd] : [valueToAdd];

const friendReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_HAS_SEEN_FRIENDS: {
      return { ...state, hasSeenFriendsExists: action.hasSeenFriends };
    }
    case UPDATE_FRIEND_LIST: {
      return { ...state, friends: action.friendList }
    }
    case UPDATE_FRIEND_ALERT: {
      const rawStatus = action.payload;
      if (!rawStatus) {
        return { ...state, friendAlertStatus: {} };
      }
      const { result: alertStatus, logIds, logsOfType, alertLog } = rawStatus;
      return { ...state, friendAlertStatus: { alertStatus, logIds, logsOfType, alertLog} };
    }
    case UPDATE_FRIEND_REQUEST_LIST: {
      return { ...state, friendRequests: action.friendRequestList };
    }
    case UPDATE_FRIEND_SAVING_POOLS: {
      return { ...state, friendSavingPools: action.savingPools };
    }
    case UPDATE_REFERRAL_DATA: {
      const referralData = { referralBoostAvailable: false };
      const rawData = action.payload;
      if (!rawData) {
        return { ...state, referralData };
      }
      
      referralData.referralCode = rawData.referralCode;
      const { floatDefaults } = rawData;
      if (!floatDefaults || !floatDefaults.boostAmountEach) {
        return { ...state, referralData };
      }

      const boostAmountOffered = safeAmountStringSplit(floatDefaults.boostAmountEach);
      if (boostAmountOffered && boostAmountOffered.amount > 0) {
        referralData.referralBoostAvailable = true;
        referralData.boostAmountOffered = boostAmountOffered;
      }

      return { ...state, referralData };
    }

    case ADD_FRIENDSHIP: {
      const { friends: priorFriends } = state;
      const friends = Array.isArray(priorFriends) ? [...priorFriends, action.friend] : [action.friend];
      return { ...state, friends }; 
    }
    case ADD_FRIEND_REQUEST: {
      const { friendRequests: oldRequests } = state;
      const friendRequests = Array.isArray(oldRequests) ? [...oldRequests, action.friendRequest] : [action.friendRequest];
      return { ...state, friendRequests };
    }
    case ADD_FRIEND_SAVING_POOL: {
      const { friendSavingPools: oldSavingPools } = state;
      const friendSavingPools = safeAddToArray(oldSavingPools, action.savingPool);
      return { ...state, friendSavingPools };
    }

    case REMOVE_FRIENDSHIP: {
      const { friends: priorFriends } = state;
      const friends = priorFriends.filter((friend) => friend.relationshipId !== action.relationshipId);
      return { ...state, friends };
    }
    case REMOVE_FRIEND_REQUEST: {
      const { friendRequests: priorRequests } = state;
      const friendRequests = priorRequests.filter((request) => request.requestId !== action.friendRequestId);
      return { ...state, friendRequests };
    }
    
    default: {
      return state;
    }
  }
}

export const isFriendAlertPending = state => {
  const { friendAlertStatus } = state[STATE_KEY];
  
  if (!friendAlertStatus) {
    return false;
  }

  const { alertStatus } = friendAlertStatus;
  if (!alertStatus || alertStatus === 'NO_ALERTS') {
    return false;
  }

  return true;
};

export const getFriendAlertData = state => {
  return state[STATE_KEY].friendAlertStatus;
}

export const getFriendList = state => state[STATE_KEY].friends;
export const getFriendRequestList = state => state[STATE_KEY].friendRequests;
export const getFriendSavingPools = state => state[STATE_KEY].friendSavingPools;
export const getReferralData = state => state[STATE_KEY].referralData;

export default friendReducer;
