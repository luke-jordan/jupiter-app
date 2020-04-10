import { BoostStatus } from '../models';

/**
 * Check boost by status
 * In order to display different actions
 */
const getPermittedTypesOfBoost = boostDetails => {
  if (
    boostDetails.boostStatus === BoostStatus.CREATED ||
    boostDetails.boostStatus === BoostStatus.OFFERED ||
    boostDetails.boostStatus === BoostStatus.UNLOCKED ||
    boostDetails.boostStatus === BoostStatus.PENDING
  ) {
    return true;
  } else {
    return false;
  }
};

export default getPermittedTypesOfBoost;
