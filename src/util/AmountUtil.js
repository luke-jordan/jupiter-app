export const getDivisor = (unit) => {
  switch (unit) {
    case 'MILLIONTH_CENT':
      return 100000000;

    case 'TEN_THOUSANDTH_CENT':
      return 1000000;

    case 'THOUSANDTH_CENT':
      return 100000;

    case 'HUNDREDTH_CENT':
      return 10000;

    case 'WHOLE_CENT':
      return 100;

    case 'WHOLE_CURRENCY':
      return 1;

    case 'DEFAULT':
      return 10000; // ie hundredth cent

    default:
      return 1;
  }
};

export const getConvertor = (fromUnit, toUnit) => {
  return getDivisor(toUnit) / getDivisor(fromUnit);
};

export const getCurrencySymbol = (currencyName) => {
  // todo improve this to handle more currencies
  switch (currencyName) {
    case 'ZAR':
      return 'R';

    default:
      return '?';
  }
};

export const extractAmount = (amountString, targetUnit = 'DEFAULT') => {
  const amountArray = amountString.split('::');
  const divisor = getDivisor(amountArray[1]) / getDivisor(targetUnit); // i.e., ratio between the two units
  return parseInt(amountArray[0], 10) * divisor;
};

export const hasDecimals = (value, unit) => {
  return ((value / getDivisor(unit)) % 1) !== 0;
}

export const getFormattedValue = (value, unit, decimals = 2) => {
  let result = (value / getDivisor(unit)).toFixed(decimals);
  result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); // I don't understand how this works. It's a plain copy paste which allows comma separators
  return result;
};

export const standardFormatAmount = (amount, unit, currency, decimals = 2) => {
  return `${getCurrencySymbol(currency)}${getFormattedValue(amount, unit, decimals)}`;
}

export const standardFormatAmountDict = ({ amount, unit, currency } = { amount: 0, unit: 'WHOLE_CURRENCY', currency: 'ZAR' }, decimals = 2) => {
  return `${getCurrencySymbol(currency)}${getFormattedValue(amount, unit, decimals)}`;
}

export const formatStringTemplate = (template, argumentDict) => {
    let str = template;
    
    Object.keys(argumentDict).forEach((key) => {
      str = str.replace(new RegExp(`\\{${key}\\}`, "gi"), argumentDict[key]);
    });

    return str;
};

export const extractConditionParameter = (condition) => {
  if (!condition) {
    return null;
  }
  const paramMatch = condition.match(/#{(.*)}/);
  return paramMatch ? paramMatch[1] : null; // to get what is inside the parens
};

export const safeAmountStringSplit = (amountString) => {
  try {
    if (typeof amountString !== 'string' || amountString.length === 0) {
      return null;
    }
    const [amount, unit, currency] = amountString.split('::');
    return { amount, unit, currency };
  } catch (err) {
    console.log('Error! Server sent bad amount string: ', err);
    return null;
  }
};

export const safeFormatStringOrDict = (amountStringOrDict, decimals = 0) => {
  if (!amountStringOrDict) {
    return 0;
  }

  const amountDict = typeof amountStringOrDict === 'string' ? safeAmountStringSplit(amountStringOrDict) : amountStringOrDict;
  if (!amountStringOrDict || Object.keys(amountStringOrDict).length === 0) {
    return 0;
  }

  return standardFormatAmountDict(amountDict, decimals);
}

export const formatPercent = (percentNumber) => `${parseInt(percentNumber, 10).toFixed(0)}%`;

/**
 * Method to calculate how much user needs to save to get from current balance to some target, where the target
 * is one of (i) an absolute target, or (ii) a major digit (e.g., $300), so long as that is above the minimum
 * @param {object} currentBalance User current balance, standard dict format
 * @param {object} minOrTargetBalance The target or minimum balance, standard dict format
 * @param {array} majorDigits If included, the target will be either the next major digit (i.e., multiple of 10 in the array)
 * or the minimum. For example, if this is [3, 5, 10], with a minOrTarget of $100, then current balance of $15 returns $85 (= $100 - $15)
 * whereas a current balance of $115 returns $185 (= $300 - $115), $300 being the next major digit (= 3 * 10 ^ 2) from $115, 
 * but $30 being lower than the minimum which is $100.
 */
export const calculateAmountToBalanceOrMajorDigit = (currentBalance, minOrTargetBalance, majorDigits) => {
  if (!currentBalance) {
    // must be from message screen, just use the whole amount (will connect up redux later)
    return minOrTargetBalance.amount / getDivisor(minOrTargetBalance.amount);
  }

  const wholeCurrencyBalance = currentBalance.amount / getDivisor(currentBalance.unit);
  const minBalanceWhole = minOrTargetBalance.amount / getDivisor(minOrTargetBalance.unit);

  const base10divisor = 10 ** Math.floor(Math.log10(wholeCurrencyBalance));
  let nextMilestoneAmount = 0;

  if (majorDigits) {
    const majorDigit = Math.floor(wholeCurrencyBalance / base10divisor); // as on backend, may be a more elegant way to do this
    const nextMilestoneDigit = majorDigits.sort((a, b) => a - b).find((digit) => majorDigit < digit);
    nextMilestoneAmount = nextMilestoneDigit * base10divisor;  
  }

  const targetAmount = Math.max(minBalanceWhole, nextMilestoneAmount);
  const roundedUpTarget = Math.ceil(targetAmount - wholeCurrencyBalance + 1); // adding the one just as sometimes the cents are tricky
  return Math.max(10, roundedUpTarget); // just to prevent negatives, and avoid signalling overly small add savings
};
