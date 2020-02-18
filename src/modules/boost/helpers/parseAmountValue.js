/*
 * Parse statusConditional save_event_greater_than ```<instruction> #{<<parameter(s)>>}``` `AMOUNT::UNIT::CURRENCY`
 */
export const equalizeAmounts = amountString => {
  const amountArray = amountString.split('::');
  const unitMultipliers = {
    HUNDREDTH_CENT: 1,
    WHOLE_CENT: 100,
    WHOLE_CURRENCY: 100 * 100,
  };
  return parseInt(amountArray[0], 10) * unitMultipliers[amountArray[1]];
};

/**
 * Parse currency
 */
export const currency = amountString => amountString.split('::')[2];
