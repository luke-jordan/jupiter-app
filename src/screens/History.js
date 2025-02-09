import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

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

import * as Animatable from 'react-native-animatable';

import { LoggingUtil } from '../util/LoggingUtil';
import { getDivisor, getCurrencySymbol } from '../util/AmountUtil';
import { Endpoints, Colors } from '../util/Values';
import PendingTransactionModal from '../elements/PendingTransactionModal';

import { getAuthToken } from '../modules/auth/auth.reducer';
import HeaderWithBack from '../elements/HeaderWithBack';

const HIGHLIGHTED_TYPES = ['USER_SAVING_EVENT', 'BOOST_REDEMPTION', 'CAPITALIZATION'];
const pendingIcon = require('../../assets/pending-clock.png');

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
});

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      fetching: false,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_SCREEN', { screen_name: 'History' });
    
    // this is the only big list in the app, so keeping it separate form state, otherwise will hit hydration & loading time
    let history = await AsyncStorage.getItem('userHistory');
    if (history) {
      history = JSON.parse(history);
      this.setState({
        netSavings: history.netSavings,
        totalEarnings: history.totalEarnings,
        history: history.userHistory,
        pending: history.userPending,
        loading: false,
      });
    }

    this.fetchHistory();
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  getItemIcon(type) {
    switch (type) {
      case 'USER_SAVING_EVENT':
        return require('../../assets/add.png');
      case 'WITHDRAWAL':
      case 'BOOST_REVOCATION':
        return require('../../assets/withdrawal.png');
      case 'BOOST_POOL_FUNDING':
        return require('../../assets/friends_1.png');
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

      case 'BOOST_POOL_FUNDING':
        return 'Tournament contribution';

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

      case 'BOOST_REVOCATION':
        return 'Boost revoked';

      default: {
        const result = type.split('_').map(word => word.toLowerCase()).join(' ');
        return result.charAt(0).toUpperCase() + result.substr(1);
      }
    }
  }

  getItemAmount(amount, unit, currency) {
    const currencySymbol = getCurrencySymbol(currency);
    const sign = amount > 0 ? '+' : '-';
    return sign + currencySymbol + this.getFormattedBalance(amount, unit);
  }

  getFormattedBalance(balance, unit) {
    if (balance < 0) balance *= -1;
    return (balance / getDivisor(unit)).toFixed(2);
  }

  getPendingTxTitle(transactionType) {
    if (transactionType === 'USER_SAVING_EVENT') {
      return 'Save with pending payment';
    }

    if (transactionType === 'WITHDRAWAL') {
      return 'Withdrawal in process';
    }

    return 'Transaction';
  }

  fetchHistory = async () => {
    try {
      if (this.state.fetching) return true;
      this.setState({ fetching: true });

      const result = await fetch(`${Endpoints.CORE}history/list`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({
          netSavings: resultJson.netSavings,
          totalEarnings: resultJson.totalEarnings,
          history: resultJson.userHistory,
          pending: resultJson.userPending,
          loading: false,
          fetching: false,
        });
        AsyncStorage.setItem('userHistory', JSON.stringify(resultJson));
      } else {
        throw result;
      }
    } catch (error) {
      // console.log('ERROR FETCHING HISTORY: ', JSON.stringify(error));
      this.setState({ loading: false, fetching: false });
    }
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onClosePendingDialog = (fetchHistory = false) => {
    this.setState({
      showPendingModal: false,
      pendingTransaction: null,
    });

    if (fetchHistory) {
      this.fetchHistory();
    }
  }

  onNavigateToEftForPending = (transactionDetails) => {
    this.setState({ showPendingModal: false });
    this.props.navigation.navigate('PendingManualTransfer', {
      token: this.props.authToken,
      humanReference: transactionDetails.humanReference,
      bankDetails: transactionDetails.bankDetails,
      transactionId: transactionDetails.transactionId,
      amountToAdd: transactionDetails.amount / getDivisor(transactionDetails.unit),
      isOnboarding: false,
    });
  };

  onNavigateToInstantForPending = (transactionDetails) => {
    this.setState({ showPendingModal: false });
    const amount = transactionDetails.amount / getDivisor(transactionDetails.unit);
    const paymentLinkTag = transactionDetails.tags.find((tag) => tag.startsWith('PAYMENT_URL::'));
    this.props.navigation.navigate('PendingInstantTransfer', {
      token: this.props.authToken,
      transactionId: transactionDetails.transactionId,
      isOnboarding: false,
      amountAdded: amount,
      bankDetails: transactionDetails.bankDetails,
      paymentLink: paymentLinkTag ? paymentLinkTag.substring('PAYMENT_URL::'.length) : '',
    });
  }

  onNavigateToSupportForPending = (preFilledSupportMessage) => {
    this.setState({ showPendingModal: false });
    const params = { preFilledSupportMessage, originScreen: 'History' };
    this.props.navigation.navigate('Support', params);
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

  // eslint-disable-next-line react/sort-comp
  onPressItem(element) {
    if (element.type === 'TRANSACTION' && element.details.transactionType === 'USER_SAVING_EVENT') {
      const defaultAmount = element.details.amount / getDivisor(element.details.unit);
      this.props.navigation.navigate('AddCash', { preFilledAmount: defaultAmount, startNewTransaction: true });
    }
  }

  renderHistoryElement(element, index) {
    let type = '';
    if (element.type === 'HISTORY') {
      type = element.details.eventType;
    } else if (element.type === 'TRANSACTION') {
      type = element.details.transactionType;
    }
    const highlightAmount = HIGHLIGHTED_TYPES.includes(type);
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
          <Text style={highlightAmount ? styles.historyAmountHighlight : styles.historyAmount}>
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

  onPressPendingItem(element) {
    this.setState({
      showPendingModal: true,
      pendingTransaction: element,
    });
  }

  renderPendingElement(element) {
    return (
      <View style={styles.historyItem} key={element.details.transactionId}>
        <TouchableOpacity onPress={() => this.onPressPendingItem(element)}>
          <Image style={styles.pendingItemIcon} source={pendingIcon} />
        </TouchableOpacity>
        <View style={styles.historyItemInfo}>
          <TouchableOpacity onPress={() => this.onPressPendingItem(element)}>
            <Text style={styles.historyTitle}>{this.getPendingTxTitle(element.details.transactionType)}</Text>
            <Text style={styles.historyDesc}>{element.details.humanReference}</Text>
          </TouchableOpacity>
        </View>
        <Text style={element.details.amount > 0 ? styles.historyAmountHighlight : styles.historyAmount}>
          {this.getItemAmount(
            element.details.amount,
            element.details.unit,
            element.details.currency
          )}
        </Text>
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => this.onPressPendingItem(element)}>
          <Icon
            name="dots-three-horizontal"
            type="entypo"
            size={25}
            color={Colors.DARK_GRAY}
          />
        </TouchableOpacity>
      </View>
    )
  }

  renderPending() {
    if (Array.isArray(this.state.pending) && this.state.pending.length > 0) {
      // we don't need to do days here, as there will not be many
      return (
        <View style={styles.dayInfo}>
          <Text style={styles.pendingHeader}>Pending</Text>
          <View style={styles.dayHistoryWrapper}>
            {this.state.pending.map((item) => this.renderPendingElement(item))}
          </View>
          <Text style={styles.pendingHeader}>Completed</Text>
        </View>

      )
    }

    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderWithBack 
          headerText="History"
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
              { this.state.fetching && (
                <Animatable.View animation="fadeInDown" style={styles.fetchingNoteContainer}>
                  <Text style={styles.fetchingNote}>Fetching latest transactions&hellip;</Text>
                </Animatable.View>
              )}
              {this.renderPending()}
              {this.renderHistory()}
            </ScrollView>
          </View>
        )}
        {this.state.showPendingModal && (
          <PendingTransactionModal
            showModal={this.state.showPendingModal}
            transaction={this.state.pendingTransaction}
            onRequestClose={this.onClosePendingDialog}
            navigateToEft={this.onNavigateToEftForPending}
            navigateToInstant={this.onNavigateToInstantForPending}
            navigateToSupport={this.onNavigateToSupportForPending}
            authToken={this.props.authToken}
          />
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
  pendingHeader: {
    marginTop: 15,
    width: '100%',
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.RED,
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
  pendingItemIcon: {
    marginHorizontal: 10,
    marginVertical: 5,
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
  historyAmountHighlight: {
    marginHorizontal: 10,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.HISTORY_GREEN,
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

export default connect(mapStateToProps)(History);
