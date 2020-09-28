import moment from 'moment';

import {
  UPDATE_SERVER_BALANCE,
  UPDATE_SHOWN_BALANCE,
  UPDATE_COMPARATOR_RATES,
  UPDATE_SAVING_HEAT,
} from './balance.actions';

const initialState = {
  lastShownBalance: 0,
  serverBalance: {
    balanceStartDayOrLastSettled: {
      amount: 0,
      unit: 'HUNDREDTH_CENT',
      currency: 'ZAR',
      datetime: moment().format(),
    },
  },
  currentSavingHeat: {
    levelName: 'no heat',
    levelColor: null,
    levelColorCode: '#35BAD5',
  },
};

export const STATE_KEY = 'balance';

const balanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SHOWN_BALANCE: {
      return {
        ...state,
        lastShownBalance: action.payload,
      };
    }
    case UPDATE_SERVER_BALANCE: {
      return {
        ...state,
        serverBalance: action.payload,
      };
    }
    case UPDATE_COMPARATOR_RATES: {
      const newServerBalance = { ...state.serverBalance };
      newServerBalance.comparatorRates = action.payload;
      return {
        ...state,
        serverBalance: newServerBalance,
      };
    }
    case UPDATE_SAVING_HEAT: {
      const { currentSavingHeat } = action;
      return { ...state, currentSavingHeat };
    }
    default: {
      return state;
    }
  }
};

export const getLastShownBalanceAmount = state =>
  state[STATE_KEY].lastShownBalance;

export const getLastServerBalanceFull = state => state[STATE_KEY].serverBalance;

export const getCurrentServerBalanceFull = state =>
  state[STATE_KEY].serverBalance.balanceStartDayOrLastSettled;

export const getCurrentReferenceAmount = state => {
  if (!state[STATE_KEY].serverBalance || !state[STATE_KEY].serverBalance.balanceStartDayOrLastSettled) {
    return 0;
  }

  return state[STATE_KEY].serverBalance.balanceStartDayOrLastSettled.amount;
}

export const getCurrentHeatLevel = state => {
  return state[STATE_KEY].currentSavingHeat;
}

export const getComparatorRates = state =>
  state[STATE_KEY].serverBalance.comparatorRates;

export const getEndOfTodayBalanceAmount = state => {
  const stateBalance = state[STATE_KEY].serverBalance;
  const currentTime = moment();
  const defaultReturn = 0; // TODO : store default currencies etc too, to make sure of avoiding mismatches
  if (!Reflect.has(stateBalance, 'balanceEndOfToday')) {
    return defaultReturn;
  }

  const endOfTodayMoment = moment(stateBalance.balanceEndOfToday.datetime);
  if (endOfTodayMoment.isSame(currentTime, 'day')) {
    return stateBalance.balanceEndOfToday.amount;
  }

  const laterDays = stateBalance.balanceSubsequentDays;
  if (!Array.isArray(laterDays) || laterDays.length === 0) {
    return defaultReturn;
  }

  const todayEntry = laterDays.find(dayProjection =>
    currentTime.isSame(moment(dayProjection.datetime, 'day'))
  );
  if (todayEntry) {
    return todayEntry.amount;
  }

  return defaultReturn;
};

export default balanceReducer;
