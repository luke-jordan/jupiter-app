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

export const getFormattedValue = (value, unit, decimals = 2) => {
  let result = (value / getDivisor(unit)).toFixed(decimals);
  result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); // I don't understand how this works. It's a plain copy paste which allows comma separators
  return result;
};

export const formatStringTemplate = (template, argumentDict) => {
    let str = template;
    
    Object.keys(argumentDict).forEach((key) => {
      str = str.replace(new RegExp(`\\{${key}\\}`, "gi"), argumentDict[key]);
    });

    return str;
};

export const extractConditionParameter = (condition) => {
  const paramMatch = condition.match(/#{(.*)}/);
  return paramMatch ? paramMatch[1] : null; // to get what is inside the parens
};