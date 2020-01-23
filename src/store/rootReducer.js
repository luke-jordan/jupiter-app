import { combineReducers } from 'redux';

import boostReducer, {
  STATE_KEY as BOOST_STATE_KEY,
} from '../modules/boost/boost.reducer';

const rootReducer = combineReducers({
  [BOOST_STATE_KEY]: boostReducer,
});

export default rootReducer;
