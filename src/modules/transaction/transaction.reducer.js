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
      console.log('Updating current transaction with payload: ', action.payload);
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

export const getCurrentTransactionDetails = state => ({
  transactionId: state[STATE_KEY].transactionId,
  transactionType: state[STATE_KEY].transactionType,
  transactionAmount: state[STATE_KEY].transactionAmount,
});

export default transactionReducer;
