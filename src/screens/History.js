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
      totalSavings: "R2,200.40",
      monthlyInterest: "R50.40",
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
        console.log(resultJson);
        this.setState({
          // history: resultJson,
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

  renderDayInfo(dayData) {
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
      <View style={styles.dayInfo}>
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
      case "deposit":
      return require('../../assets/add.png');
      case "withdrawal":
      return require('../../assets/withdrawal.png');
      case "interest":
      return require('../../assets/interest.png');
      default:
      return require('../../assets/interest.png');
    }
  }

  getItemTitle(type) {
    switch (type) {
      case "deposit":
      return "Cash Added";
      case "withdrawal":
      return "Withdrawal";
      case "interest":
      return "Interest";
      default:
      return "";
    }
  }

  renderHistoryElement(element, index) {
    return (
      <View style={styles.historyItem} key={index ? index : null}>
        <Image style={styles.historyItemIcon} source={this.getItemIcon(element.type)}/>
        <View style={styles.historyItemInfo}>
          <Text style={styles.historyTitle}>{this.getItemTitle(element.type)}</Text>
          {
            element.desc ?
            <Text style={styles.historyDesc}>{element.desc}</Text>
            : null
          }
        </View>
        <Text style={styles.historyAmount}>{element.amount}</Text>
      </View>
    );
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
              {this.renderDayInfo([
                moment(),
                {"amount": "+R300.00", "type": "deposit", "desc": "LJORDAN12-00023"},
                {"amount": "-R100.00", "type": "withdrawal", "desc": "LJORDAN12-00095"}
              ])}
              {this.renderDayInfo([
                moment().subtract(1, 'days'),
                {"amount": "+R20.00", "type": "interest"}
              ])}
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
});
