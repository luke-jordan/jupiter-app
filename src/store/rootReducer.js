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

const rootReducer = combineReducers({
  [BOOST_STATE_KEY]: boostReducer,
  [BALANCE_STATE_KEY]: balanceReducer,
  [AUTH_STATE_KEY]: authReducer,
});

export default rootReducer;
