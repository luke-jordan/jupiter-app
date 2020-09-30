import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

import * as Animatable from 'react-native-animatable';

import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getRequest } from '../modules/auth/auth.helper';

import { getCurrentHeatLevel } from '../modules/balance/balance.reducer';

import HeaderWithBack from '../elements/HeaderWithBack';

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  heatLevel: getCurrentHeatLevel(state),
});

class SavingHeat extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      fetching: false,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_SCREEN', { screen_name: 'SavingHeat' });
    this.fetchHeat();
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  getItemIcon(type) {
    switch (type) {
      case 'USER_SAVING_EVENT':
        return require('../../assets/add.png');
      case 'WITHDRAWAL':
      case 'BOOST_REDEMPTION':
        return require('../../assets/completed.png');
      default:
        return require('../../assets/interest.png');
    }
  }

  getItemTitle(type) {
    switch (type) {
      case 'USER_SAVING_EVENT':
        return 'Made a save';

      case 'WITHDRAWAL':
        return 'Withdrawal';

      case 'BOOST_REDEMPTION':
        return 'Boost claimed';

      default: {
        const result = type.split('_').map(word => word.toLowerCase()).join(' ');
        return result.charAt(0).toUpperCase() + result.substr(1);
      }
    }
  }

  fetchHeat = async () => {
    try {
      if (this.state.fetching) return true;
      this.setState({ fetching: true });

      const result = await getRequest({ url: `${Endpoints.CORE}heat/fetch`, token: this.props.authToken });
      
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({
          history: resultJson.userHistory,
          loading: false,
          fetching: false,
        });
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false, fetching: false });
    }
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

  // todo : consider adding in some form of transition to add cash once transaction-heat bridge fully in place
  renderHistoryElement(element, index) {
    let type = '';
    if (element.type === 'HISTORY') {
      type = element.details.eventType;
    } else if (element.type === 'TRANSACTION') {
      type = element.details.transactionType;
    }
    return (
      <View style={styles.historyItem} key={index ? index : null}>
        <TouchableOpacity onPress={() => this.onPressItem(element)}>
          <Image style={styles.historyItemIcon} resizeMode="contain" source={this.getItemIcon(type)} />
        </TouchableOpacity>
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

  renderHeatHistory() {
    if (this.state.history && this.state.history.length > 0) {
      const history = this.state.history.sort((a, b) =>
        a.timestamp < b.timestamp ? 1 : -1
      );

      let currentDate = moment(history[0].timestamp); // there is always at least one record (first save)
      let currentDay = [currentDate];
      const renderInfo = [];

      for (const record of history) {
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
        <HeaderWithBack 
          headerText="Saving Heat"
          onPressBack={this.onPressBack}
        />
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
                  Your heat level
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.savingsSection}>
                <Text style={styles.savingsAmount}>
                  {this.state.totalEarnings}
                </Text>
                <Text style={styles.savingsDesc}>Heat points</Text>
              </View>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.mainContent}
            >
              { this.state.fetching && (
                <Animatable.View animation="fadeInDown" style={styles.fetchingNoteContainer}>
                  <Text style={styles.fetchingNote}>Fetching heat record&hellip;</Text>
                </Animatable.View>
              )}
              {this.renderHeatHistory()}
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
    // marginHorizontal: 15,
  },
  dayInfo: {
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
  fetchingNoteContainer: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 10,
  },
  fetchingNote: {
    fontFamily: 'poppins-semibold',
    marginVertical: 10,
    fontSize: 16,
    color: Colors.PURPLE,
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
    maxHeight: 20,
    maxWidth: 20,
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
    fontFamily: 'poppins-regular',
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

export default connect(mapStateToProps)(SavingHeat);
