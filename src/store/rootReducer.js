import { combineReducers } from 'redux';

import authReducer, {
  STATE_KEY as AUTH_STATE_KEY,
} from '../modules/auth/auth.reducer';

import boostReducer, {
  STATE_KEY as BOOST_STATE_KEY,
} from '../modules/boost/boost.reducer';

import balanceReducer, {
  STATE_KEY as BALANCE_STATE_KEY,
} from '../modules/balance/balance.reducer';

import profileReducer, {
  STATE_KEY as PROFILE_STATE_KEY,
} from '../modules/profile/profile.reducer';

import friendReducer, {
  STATE_KEY as FRIEND_STATE_KEY,
} from '../modules/friend/friend.reducer';

import transactionReducer, {
  STATE_KEY as TRANSACTION_STATE_KEY,
} from '../modules/transaction/transaction.reducer';

const appReducer = combineReducers({
  [BOOST_STATE_KEY]: boostReducer,
  [BALANCE_STATE_KEY]: balanceReducer,
  [AUTH_STATE_KEY]: authReducer,
  [TRANSACTION_STATE_KEY]: transactionReducer,
  [PROFILE_STATE_KEY]: profileReducer,
  [FRIEND_STATE_KEY]: friendReducer,
});

// as nicely explained/answered here: https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    state = undefined;
  }

  return appReducer(state, action);
}

export default rootReducer;
