export const getDivisor = unit => {
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

    default:
      return 1;
  }
};

export const getCurrencySymbol = currencyName => {
  // todo improve this to handle more currencies
  switch (currencyName) {
    case 'ZAR':
      return 'R';

    default:
      return '?';
  }
};

export const getFormattedValue = (value, unit) => {
  let result = (value / getDivisor(unit)).toFixed(2);
  result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); // I don't understand how this works. It's a plain copy paste which allows comma separators
  return result;
};

export const formatString = (template, argumentDict) => {
    let str = template;
    
    Object.keys(argumentDict).forEach((key) => {
      str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), argumentDict[key]);
    })

    return str;
};