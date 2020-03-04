export const namespace = 'AUTH';

export const UPDATE_AUTH_TOKEN = `${namespace}/UPDATE_AUTH_TOKEN`;
export const REMOVE_AUTH_TOKEN = `${namespace}/REMOVE_AUTH_TOKEN`;

export const updateAuthToken = token => ({
  type: UPDATE_AUTH_TOKEN,
  token,
});

export const removeAuthToken = token => ({
  type: REMOVE_AUTH_TOKEN,
  token,
});
