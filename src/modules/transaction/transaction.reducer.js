import { UPDATE_CURRENT_TRANSACTION, CLEAR_CURRENT_TRANSACTION } from './transaction.actions';

const initialState = {
  hasActiveTransaction: false,
  transactionId: null,
  transactionType: null,
  transactionAmount: {}, 
};

export const STATE_KEY = 'transaction';

const transactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CURRENT_TRANSACTION: {
      // update any carried properties
      return { ...state, ...action.payload };
    }
    case CLEAR_CURRENT_TRANSACTION: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export const hasCurrentTransaction = state => state[STATE_KEY].hasActiveTransaction;

export const getCurrentTransactionDetails = state => state[STATE_KEY];

export default transactionReducer;
