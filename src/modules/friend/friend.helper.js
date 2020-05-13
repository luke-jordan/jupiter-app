import { SAVING_HEAT_LEVELS, SAVING_HEAT_COLOURS, SAVING_HEAT_DESCRIPTIONS } from './friend.constant';

const REVERSED_HEAT_LEVELS = SAVING_HEAT_LEVELS.slice().reverse();

export const obtainHeatLevelIndex = (savingHeat) => {
  const reversedIndex = REVERSED_HEAT_LEVELS.findIndex((heatLevelBottom) => savingHeat >= heatLevelBottom);
  const forwardIndex = SAVING_HEAT_LEVELS.length - 1 - reversedIndex;
  return forwardIndex;
};

export const obtainColorForHeat = (savingHeat) => SAVING_HEAT_COLOURS[obtainHeatLevelIndex(savingHeat)];

export const obtainDescriptionForHeat = (savingHeat) => SAVING_HEAT_DESCRIPTIONS[obtainHeatLevelIndex(savingHeat)];
