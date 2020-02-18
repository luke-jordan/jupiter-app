export const namespace = 'ONBOARDING';

export const CHECK_FOR_CREDENTIALS = `${namespace}/CHECK_FOR_CREDENTIALS`;

export const checkCredentialsPresent = () => ({
  type: CHECK_FOR_CREDENTIALS,
});
