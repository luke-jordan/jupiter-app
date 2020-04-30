import {
  UPDATE_FRIEND_LIST,
  UPDATE_FRIEND_ALERT_PENDING,
  UPDATE_FRIEND_REQUEST_LIST,
  UPDATE_REFERRAL_DATA,
} from './friend.actions';

const initialState = {
  friends: [
  ],
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
      return { ...state, referralData: action.payload };
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
