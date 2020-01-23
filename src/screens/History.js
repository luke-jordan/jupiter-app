/* eslint-disable fp/no-mutating-methods */
import moment from 'moment';
import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  AsyncStorage,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';

export default class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_SCREEN', { screen_name: 'History' });
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
    }
    const { token } = info;

    let history = await AsyncStorage.getItem('userHistory');
    if (history) {
      history = JSON.parse(history);
      this.setState({
        netSavings: history.netSavings,
        totalEarnings: history.totalEarnings,
        history: history.userHistory,
        loading: false,
      });
    }
    this.fetchHistory(token);
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  getItemIcon(type) {
    switch (type) {
      case 'USER_SAVING_EVENT':
        return require('../../assets/add.png');
      case 'WITHDRAWAL':
        return require('../../assets/withdrawal.png');
      case 'CAPITALIZATION':
        return require('../../assets/interest.png');
      case 'BOOST_REDEMPTION':
        return require('../../assets/completed.png');
      default:
        return require('../../assets/interest.png');
    }
  }

  getItemTitle(type) {
    switch (type) {
      case 'USER_SAVING_EVENT':
        return 'Cash Added';

      case 'WITHDRAWAL':
        return 'Withdrawal';

      case 'INTEREST':
        return 'Interest';

      case 'BOOST_REDEMPTION':
        return 'Boost claimed';

      case 'CAPITALIZATION':
        return 'Interest paid';

      case 'USER_REGISTERED':
        return 'Registered your account';

      case 'PASSWORD_SET':
        return 'Set your password';

      case 'ID_VERIFIED':
        return 'ID number verified';

      case 'PASSWORD_CHANGED':
        return 'Changed your password';

      case 'PROFILE_UPDATED':
        return 'Changed your profile details';

      default: {
        const result = type
          .split('_')
          .map(word => word.toLowerCase())
          .join(' ');
        return result.charAt(0).toUpperCase() + result.substr(1);
      }
    }
  }

  getItemAmount(amount, unit, currency) {
    const currencySymbol = this.getCurrencySymbol(currency);
    const sign = amount > 0 ? '+' : '-';
    return sign + currencySymbol + this.getFormattedBalance(amount, unit);
  }

  getCurrencySymbol(currencyName) {
    // todo improve this to handle more currencies
    switch (currencyName) {
      case 'ZAR':
        return 'R';

      default:
        return '?';
    }
  }

  getFormattedBalance(balance, unit) {
    if (balance < 0) balance *= -1;
    return (balance / this.getDivisor(unit)).toFixed(2);
  }

  getDivisor(unit) {
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
  }

  fetchHistory = async token => {
    try {
      const result = await fetch(`${Endpoints.CORE}history/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({
          netSavings: resultJson.netSavings,
          totalEarnings: resultJson.totalEarnings,
          history: resultJson.userHistory,
          loading: false,
        });
        AsyncStorage.setItem('userHistory', JSON.stringify(resultJson));
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  renderDayHeader(day) {
    return <Text style={styles.dayHeader}>{moment(day).format('LL')}</Text>;
  }

  renderDayInfo(dayData, parentIndex) {
    const header = dayData[0];
    dayData.shift();
    const dayRender = [];
    let index = 0;
    for (const current of dayData) {
      dayRender.push(this.renderHistoryElement(current, index));
      index += 1;
      dayRender.push(<View style={styles.daySeparator} key={index} />);
      index += 1;
    }
    dayRender.pop();
    return (
      <View style={styles.dayInfo} key={parentIndex}>
        {this.renderDayHeader(header)}
        <View style={styles.dayHistoryWrapper}>{dayRender}</View>
      </View>
    );
  }

  renderHistoryElement(element, index) {
    let type = '';
    if (element.type === 'HISTORY') {
      type = element.details.eventType;
    } else if (element.type === 'TRANSACTION') {
      type = element.details.transactionType;
    }
    return (
      <View style={styles.historyItem} key={index ? index : null}>
        <Image style={styles.historyItemIcon} source={this.getItemIcon(type)} />
        <View style={styles.historyItemInfo}>
          <Text style={styles.historyTitle}>{this.getItemTitle(type)}</Text>
          {element.details.humanReference ? (
            <Text style={styles.historyDesc}>
              {element.details.humanReference}
            </Text>
          ) : null}
        </View>
        {element.type === 'TRANSACTION' ? (
          <Text style={styles.historyAmount}>
            {this.getItemAmount(
              element.details.amount,
              element.details.unit,
              element.details.currency
            )}
          </Text>
        ) : null}
      </View>
    );
  }

  renderHistory() {
    // const logRecord = (record) => console.log(`Type: ${record.type}, time: ${moment(record.timestamp).format('YYYY-MM-DD')}`);
    if (this.state.history && this.state.history.length > 0) {
      const history = this.state.history.sort((a, b) =>
        a.timestamp < b.timestamp ? 1 : -1
      );

      // setup
      let currentDate = moment(history[0].timestamp); // there is always at least one record (user registration)
      let currentDay = [currentDate];
      const renderInfo = [];

      for (const record of history) {
        // logRecord(record); // keeping this handy utility method around in case we need it again
        // if the record is in the same day, add it to the present day array, otherwise start a new one
        if (moment(record.timestamp).isSame(currentDate, 'day')) {
          currentDay.push(record);
        } else {
          renderInfo.push(currentDay); // since render info is an array of days
          currentDate = moment(record.timestamp); // to start the new day with the right header
          currentDay = [currentDate, record]; // since the render method expects first row to be the date, for header
        }
      }
      // as there will be a final day not yet pushed
      renderInfo.push(currentDay);

      return (
        <View style={{ width: '100%' }}>
          {renderInfo.map((item, index) => this.renderDayInfo(item, index))}
        </View>
      );
    } else {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No results!</Text>
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History</Text>
        </View>
        {this.state.loading ? (
          <View style={styles.contentWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <View style={styles.savingsView}>
              <View style={styles.savingsSection}>
                <Text style={styles.savingsAmount}>
                  {this.state.netSavings}
                </Text>
                <Text style={styles.savingsDesc}>
                  Amount you&apos;ve put in
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.savingsSection}>
                <Text style={styles.savingsAmount}>
                  {this.state.totalEarnings}
                </Text>
                <Text style={styles.savingsDesc}>Total boosts + interest</Text>
              </View>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.mainContent}
            >
              {this.renderHistory()}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  scrollView: {
    marginTop: 20,
    backgroundColor: Colors.BACKGROUND_GRAY,
    width: '100%',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  savingsView: {
    marginTop: 15,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.WHITE,
  },
  savingsSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsAmount: {
    fontFamily: 'poppins-semibold',
    fontSize: 28,
    color: Colors.PURPLE,
    marginBottom: -1,
  },
  savingsDesc: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
  separator: {
    height: '80%',
    backgroundColor: Colors.GRAY,
    width: 1,
    alignSelf: 'center',
  },
  dayHeader: {
    marginTop: 15,
    width: '100%',
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.PURPLE,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  historyItemIcon: {
    marginHorizontal: 10,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyTitle: {
    fontFamily: 'poppins-medium',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  historyDesc: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
  },
  historyAmount: {
    marginHorizontal: 10,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.DARK_GRAY,
  },
  daySeparator: {
    height: 1,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  dayHistoryWrapper: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    borderRadius: 5,
    marginVertical: 10,
  },
  placeholder: {
    paddingVertical: 50,
  },
  placeholderText: {
    alignSelf: 'center',
    fontFamily: 'poppins-regular',
  },
});
