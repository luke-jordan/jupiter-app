import { BoostStatus } from '../models';

const getPermittedTypesOfBoost = boostDetails => {
  if (
    boostDetails.boostStatus === BoostStatus.CREATED ||
    boostDetails.boostStatus === BoostStatus.OFFERED ||
    boostDetails.boostStatus === BoostStatus.PENDING
  ) {
    return true;
  } else {
    return false;
  }
};

export default getPermittedTypesOfBoost;
