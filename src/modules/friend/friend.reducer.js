import {
  UPDATE_FRIEND_LIST,
  UPDATE_FRIEND_ALERT_PENDING,
  UPDATE_FRIEND_REQUEST_LIST,
  UPDATE_REFERRAL_DATA,
  ADD_FRIENDSHIP,
  ADD_FRIEND_REQUEST,
  REMOVE_FRIENDSHIP,
  REMOVE_FRIEND_REQUEST,
} from './friend.actions';

import { safeAmountStringSplit } from '../../util/AmountUtil';

const initialState = {
  friends: [],
  friendRequests: [],
  referralData: {},
  friendAlertPending: false,
};

export const STATE_KEY = 'friend';

const friendReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_FRIEND_LIST: {
      return { ...state, friends: action.friendList }
    }
    case UPDATE_FRIEND_ALERT_PENDING: {
      return { ...state, friendAlertPending: action.isPending };
    }
    case UPDATE_FRIEND_REQUEST_LIST: {
      return { ...state, friendRequests: action.friendRequestList };
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
      const friends = [...priorFriends, action.friend];
      return { ...state, friends }; 
    }
    case ADD_FRIEND_REQUEST: {
      const { friendRequests: oldRequests } = state;
      const friendRequests = [...oldRequests, action.friendRequest];
      return { ...state, friendRequests };
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

export const isFriendAlertPending = state => state[STATE_KEY].friendAlertPending;
export const getFriendList = state => state[STATE_KEY].friends;
export const getFriendRequestList = state => state[STATE_KEY].friendRequests;
export const getReferralData = state => state[STATE_KEY].referralData;

export default friendReducer;
