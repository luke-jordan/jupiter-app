import { UPDATE_BOOST_COUNT } from './boost.actions';

const initialState = {
  boostCount: 0,
};

export const STATE_KEY = 'boost';

const boostReducer = (state = initialState, action) => {  
  switch (action.type) {
    case UPDATE_BOOST_COUNT: {
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

export const getHasBoostsAvailable = state => state[STATE_KEY].boostCount > 0;

export default boostReducer;
