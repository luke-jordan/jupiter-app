import { CHECK_FOR_CREDENTIALS } from './home.actions';

const initialState = {
  isOnboarding: false,
};

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHECK_FOR_CREDENTIALS: {
      return {
        ...state,
        boostCount: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

// export const getHasBoostsAvailable = state => state[STATE_KEY].boostCount > 0;

export default homeReducer;
