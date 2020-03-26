export const namespace = 'PROFILE';

export const UPDATE_USER_ID = `${namespace}/UPDATE_USER_ID`;
export const UPDATE_ACCOUNT_ID = `${namespace}/UPDATE_ACCOUNT_ID`;
export const UPDATE_PROFILE_DATA = `${namespace}/UPDATE_PROFILE_DATA`;
export const UPDATE_PROFILE_FIELD = `${namespace}/UPDATE_PROFILE_FIELD`;
export const REMOVE_ONBOARD_STEP_LEFT = `${namespace}/REMOVE_ONBOARD_STEP_LEFT`;
export const UPDATE_ONBOARD_STEPS_LEFT = `${namespace}/UPDATE_ONBOARD_STEPS_LEFT`;
export const UPDATE_ALL_FIELDS = `${namespace}/UPDATE_ALL_FIELDS`;

export const updateUserId = systemWideUserId => ({
  type: UPDATE_USER_ID,
  systemWideUserId,
});

export const updateAccountId = accountId => ({
  type: UPDATE_ACCOUNT_ID,
  accountId,
});

export const updateProfileFields = payload => ({
  type: UPDATE_PROFILE_FIELD,
  payload,
});

export const updateOnboardSteps = onboardStepsRemaining => ({
  type: UPDATE_ONBOARD_STEPS_LEFT,
  onboardStepsRemaining,
});

export const removeOnboardStep = stepCompleted => ({
  type: REMOVE_ONBOARD_STEP_LEFT,
  stepCompleted,
});

export const updateAllFields = userInfo => ({
  type: UPDATE_ALL_FIELDS,
  userInfo,
})