export const namespace = 'TRANSACTION';

export const UPDATE_CURRENT_TRANSACTION = `${namespace}/UPDATE_CURRENT_TRANSACTION`;
export const CLEAR_CURRENT_TRANSACTION = `${namespace}/CLEAR_CURRENT_TRANSACTION`;

export const updateCurrentTransaction = payload => ({
  type: UPDATE_CURRENT_TRANSACTION,
  payload,
});

export const clearCurrentTransaction = payload => ({
  type: CLEAR_CURRENT_TRANSACTION,
  payload,
});
