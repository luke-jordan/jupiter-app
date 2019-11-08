import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';
import moment from 'moment';

export default class History extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent("USER_ENTERED_SCREEN", {"screen_name": "History"});
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
    }
    let token = info.token;
    await this.setState({
      token: token,
    });
    this.fetchHistory(token);
  }

  fetchHistory = async (token) => {
    try {
      let result = await fetch(Endpoints.CORE + 'history/list', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
        method: 'GET',
      });
      if (result.ok) {
        let resultJson = await result.json();
        let balance = resultJson.userBalance.currentBalance;
        this.setState({
          totalSavings: this.getCurrencySymbol(balance.currency) + this.getFormattedBalance(balance.amount, balance.unit),
          monthlyInterest: resultJson.accruedInterest,
          history: resultJson.userHistory,
          loading: false,
        });
      } else {
        throw result;
      }
    } catch (error) {
      console.log("error!", error.status);
      this.setState({loading: false});
    }

  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  renderDayHeader(day) {
    return (
      <Text style={styles.dayHeader}>{moment(day).format('LL')}</Text>
    );
  }

  renderDayInfo(dayData, parentIndex) {
    let header = dayData[0];
    dayData.shift();
    let dayRender = [];
    let index = 0;
    for (let current of dayData) {
      dayRender.push(this.renderHistoryElement(current, index));
      index++;
      dayRender.push(<View style={styles.daySeparator} key={index} />);
      index++;
    }
    dayRender.pop();
    return (
      <View style={styles.dayInfo} key={parentIndex}>
        {
          this.renderDayHeader(header)
        }
        <View style={styles.dayHistoryWrapper}>
          {
            dayRender
          }
        </View>
      </View>
    );
  }

  getItemIcon(type) {
    switch (type) {
      case "USER_SAVING_EVENT":
      return require('../../assets/add.png');
      case "WITHDRAWAL":
      return require('../../assets/withdrawal.png');
      case "INTEREST":
      return require('../../assets/interest.png');
      default:
      return require('../../assets/interest.png');
    }
  }

  getItemTitle(type) {
    switch (type) {
      case "USER_SAVING_EVENT":
      return "Cash Added";

      case "WITHDRAWAL":
      return "Withdrawal";

      case "INTEREST":
      return "Interest";

      case "USER_REGISTERED":
      return "Registered your account";

      case "PASSWORD_SET":
      return "Set your password";

      case "ID_VERIFIED":
      return "ID number verified";

      case "PASSWORD_CHANGED":
      return "Changed your password";

      case "PROFILE_UPDATED":
      return "Changed your profile details";

      default:
      let result = type.split("_").map((word) => { return word.toLowerCase();}).join(" ");
      result = result.charAt(0).toUpperCase() + result.substr(1);
      return "";
    }
  }

  getItemAmount(amount, unit, currency) {
    let currencySymbol = this.getCurrencySymbol(currency);
    let sign = amount > 0 ? "+" : "-";
    return sign + currencySymbol + this.getFormattedBalance(amount, unit);
  }

  getCurrencySymbol(currencyName) {
    //todo improve this to handle more currencies
    switch (currencyName) {
      case "ZAR":
      return "R";

      default:
      return "?";
    }
  }

  getFormattedBalance(balance, unit) {
    if (balance < 0) balance *= -1;
    return (balance / this.getDivisor(unit)).toFixed(2);
  }

  getDivisor(unit) {
    switch(unit) {
      case "MILLIONTH_CENT":
      return 100000000;

      case "TEN_THOUSANDTH_CENT":
      return 1000000;

      case "THOUSANDTH_CENT":
      return 100000;

      case "HUNDREDTH_CENT":
      return 10000;

      case "WHOLE_CENT":
      return 100;

      case "WHOLE_CURRENCY":
      return 1;

      default:
      return 1;
    }
  }


  renderHistoryElement(element, index) {
    let type = "";
    if (element.type == "HISTORY") {
      type = element.details.eventType;
    } else if (element.type == "TRANSACTION") {
      type = element.details.transactionType;
    }
    return (
      <View style={styles.historyItem} key={index ? index : null}>
        <Image style={styles.historyItemIcon} source={this.getItemIcon(type)}/>
        <View style={styles.historyItemInfo}>
          <Text style={styles.historyTitle}>{this.getItemTitle(type)}</Text>
          {
            element.desc ?
            <Text style={styles.historyDesc}>{element.details.humanReference}</Text>
            : null
          }
        </View>
        {
          element.type == "TRANSACTION" ?
          <Text style={styles.historyAmount}>{this.getItemAmount(element.details.amount, element.details.unit, element.details.currency)}</Text>
          : null
        }
      </View>
    );
  }

  renderHistory() {
    if (this.state.history && this.state.history.length > 0) {
      let history = this.state.history.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);
      let currentDate;
      let currentDay = [], renderInfo = [];
      for (let record of history) {
        if (currentDay.length == 0) {
          currentDate = moment(record.timestamp);
          currentDay.push(currentDate);
        }
        if (moment(record.timestamp).isSame(currentDate, 'day')) {
          currentDay.push(record);
        } else {
          renderInfo.push(currentDay);
          currentDay = [];
        }
      }
      renderInfo.push(currentDay);

      return (
        <View style={{width: '100%'}}>
          {
            renderInfo.map((item, index) => this.renderDayInfo(item, index))
          }
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
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History</Text>
        </View>
        {
          this.state.loading ?
          <View style={styles.contentWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
          </View>
          :
          <View style={styles.contentWrapper}>
            <View style={styles.savingsView}>
              <View style={styles.savingsSection}>
                <Text style={styles.savingsAmount}>{this.state.totalSavings}</Text>
                <Text style={styles.savingsDesc}>Your total savings</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.savingsSection}>
                <Text style={styles.savingsAmount}>{this.state.monthlyInterest}</Text>
                <Text style={styles.savingsDesc}>Interest this month</Text>
              </View>

            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.mainContent}>
              {
                this.renderHistory()
              }
            </ScrollView>
          </View>
        }
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
    backgroundColor: 'white',
  },
  savingsSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsAmount: {
    fontFamily: 'poppins-semibold',
    fontSize: 22,
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
    backgroundColor: 'white',
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
