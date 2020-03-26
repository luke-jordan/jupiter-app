import { 
  UPDATE_USER_ID, 
  UPDATE_ACCOUNT_ID, 
  UPDATE_PROFILE_DATA, 
  UPDATE_PROFILE_FIELD, 
  UPDATE_ONBOARD_STEPS_LEFT, 
  REMOVE_ONBOARD_STEP_LEFT, 
  UPDATE_ALL_FIELDS ,
} from './profile.actions';

const initialState = {
  profile: {},
};

export const STATE_KEY = 'profile';

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USER_ID: {
      return { ...state, systemWideUserId: action.systemWideUserId }
    }

    case UPDATE_ACCOUNT_ID: {
      return { ...state, accountId: action.accountId };
    }

    case UPDATE_PROFILE_DATA: {
      return { ...state, profile: action.profileData };
    }

    case UPDATE_PROFILE_FIELD: {
      const profile = { ...state.profile, ...action.payload };
      return { ...state, profile };
    }

    case UPDATE_ONBOARD_STEPS_LEFT: {
      return { ...state, onboardStepsRemaining: action.onboardStepsRemaining };
    }

    case REMOVE_ONBOARD_STEP_LEFT: {
      if (!state.onboardStepsRemaining) {
        return state;
      }

      const revisedStepsRemaining = state.onboardStepsRemaining.filter((step) => step !== action.stepCompleted);
      return { ...state, onboardStepsRemaining: revisedStepsRemaining };
    }

    case UPDATE_ALL_FIELDS: {
      const { userInfo } = action;
      
      if (typeof userInfo !== 'object' || userInfo === null || Object.keys(userInfo).length === 0) {
        return state;
      }
      
      const revisedState = { ...state };
      
      if (typeof userInfo.systemWideUserId === 'string' && userInfo.systemWideUserId.length > 0) {
        revisedState.systemWideUserId = userInfo.systemWideUserId;
      }
  
      if (Array.isArray(userInfo.onboardStepsRemaining)) {
        revisedState.onboardStepsRemaining = userInfo.onboardStepsRemaining;
      }
    
      if (userInfo.balance && Array.isArray(userInfo.balance.accountId) && userInfo.balance.accountId.length > 0) {
        [revisedState.accountId] = userInfo.balance.accountId;
      }

      if (userInfo.profile) {
        const priorProfile = state.profile;
        revisedState.profile = { ...priorProfile, ...userInfo.profile };
      }

      return revisedState;
    }

    default: {
      return state;
    }
  }
};

export const getUserId = state => state[STATE_KEY].systemWideUserId;
export const getAccountId = state => state[STATE_KEY].accountId;
export const getProfileData = state => state[STATE_KEY].profile;

export const getOnboardStepsRemaining = state => state[STATE_KEY].onboardStepsRemaining;

export default profileReducer;
