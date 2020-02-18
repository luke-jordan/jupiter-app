import React from 'react';
import { connect } from 'react-redux';

import {
  StyleSheet,
  View,
  Text,
  AsyncStorage,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Icon, Input, Button } from 'react-native-elements';

import { NavigationUtil } from '../util/NavigationUtil';
import { Colors, Endpoints } from '../util/Values';
import { LoggingUtil } from '../util/LoggingUtil';
import { getDivisor } from '../util/AmountUtil';

import { getComparatorRates } from '../modules/balance/balance.reducer';

const mapStateToProps = state => ({
  comparatorRates: getComparatorRates(state),
});

class AddCash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: 'R',
      balance: 0,
      amountToAdd: '',
      isOnboarding: false,
      loading: false,
      notWholeNumber: false,
    };
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    if (params) {
      this.setState({
        isOnboarding: params.isOnboarding,
        token: params.token,
        accountId: params.accountId,
      });
    }

    if (!params || !params.isOnboarding) {
      // eslint-disable-next-line prefer-const
      let [info, lastSaveAmount] = await Promise.all([
        AsyncStorage.getItem('userInfo'),
        AsyncStorage.getItem('lastSaveAmount'),
      ]);
      if (!info) {
        NavigationUtil.logout(this.props.navigation);
      } else {
        info = JSON.parse(info);
        this.setState({
          balance: info.balance.currentBalance.amount,
          unit: info.balance.currentBalance.unit,
          token: info.token,
          accountId: info.balance.accountId[0],
        });
      }

      const preFilledAmount = this.props.navigation.getParam('preFilledAmount');
      if (preFilledAmount) {
        this.setState({ 
          amountToAdd: preFilledAmount.toFixed(0),
        })
      } else if (lastSaveAmount) {
        const lastSave = parseInt(lastSaveAmount, 10);
        this.setState({
          amountToAdd: parseFloat(lastSave).toFixed(0),
        });
      }
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onPressAddCash = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    if (this.state.isOnboarding) {
      LoggingUtil.logEvent('USER_INITIATED_FIRST_ADD_CASH', {
        amountAdded: this.state.amountToAdd,
      });
    } else {
      LoggingUtil.logEvent('USER_INITIATED_ADD_CASH', {
        amountAdded: this.state.amountToAdd,
      });
    }
    try {
      AsyncStorage.setItem(
        'lastSaveAmount',
        parseFloat(this.state.amountToAdd).toFixed(0)
      );
      const result = await fetch(`${Endpoints.CORE}addcash/initiate`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify({
          accountId: this.state.accountId,
          amount: this.state.amountToAdd * 10000, // multiplying by 100 to get cents and again by 100 to get hundreth cent
          currency: 'ZAR', // TODO implement for handling other currencies
          unit: 'HUNDREDTH_CENT',
        }),
      });
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({ loading: false });
        this.props.navigation.navigate('Payment', {
          urlToCompletePayment:
            resultJson.paymentRedirectDetails.urlToCompletePayment,
          accountTransactionId:
            resultJson.transactionDetails[0].accountTransactionId,
          humanReference: resultJson.humanReference,
          token: this.state.token,
          isOnboarding: this.state.isOnboarding,
          amountAdded: this.state.amountToAdd,
        });
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Add cash failed: ', error);
      LoggingUtil.logEvent('ADD_CASH_FAILED_UNKNOWN', {
        serverResponse: JSON.stringify(error.message),
      });
      this.setState({ loading: false });
      // this.showError();
    }
  };

  onChangeAmount = text => {
    const wholeNumberRegex = /^[0-9\b]+$/;
    if (wholeNumberRegex.test(text) || text.trim().length === 0) {
      this.setState({
        amountToAdd: text,
        notWholeNumber: false,
      });
    } else {
      this.setState({
        notWholeNumber: true,
      });
    }
  };

  onChangeAmountEnd = () => {
    this.setState({
      amountToAdd: parseFloat(this.state.amountToAdd).toFixed(0),
    });
    this.amountInputRef.blur();
  };

  getFormattedBalance(balance) {
    return (balance / getDivisor(this.state.unit)).toFixed(0);
  }

  getBankRate(bank) {
    let result = 0;
    let bankThreshold = -1;
    const relevantAmount =
      parseInt(this.state.amountToAdd) +
      parseInt(this.getFormattedBalance(this.state.balance));
    for (const key in bank) {
      if (key === 'label') continue;

      const keyInt = parseInt(key);
      if (relevantAmount > keyInt && keyInt > bankThreshold) {
        result = bank[key];
        bankThreshold = keyInt;
      }
    }
    return parseFloat(result / 100).toFixed(2);
  }

  getReferenceRate() {
    if (
      this.props.comparatorRates &&
      this.props.comparatorRates.referenceRate
    ) {
      return parseFloat(this.props.comparatorRates.referenceRate / 100).toFixed(
        2
      );
    }

    return '';
  }

  renderHeader() {
    if (this.state.isOnboarding) {
      return (
        <View style={styles.headerWrapper}>
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
          </View>
          <Text style={styles.headerTitleOnboarding}>Add some cash</Text>
        </View>
      );
    } else {
      return (
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
          <Text style={styles.headerTitle}>Add cash</Text>
        </View>
      );
    }
  }

  renderBankLine(item, index) {
    const bank = this.props.comparatorRates.rates[item];
    return (
      <View style={styles.rateLine} key={index}>
        <Text style={styles.rateComparisonBank}>{bank.label}</Text>
        <Text style={styles.rateComparisonBank}>{this.getBankRate(bank)}%</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentContainer}
        >
          {this.state.isOnboarding ? (
            <Text style={styles.onboardingTitle}>Choose an amount</Text>
          ) : (
            <View style={styles.currentBalance}>
              <Text style={styles.balanceAmount}>
                {this.state.currency}
                {this.getFormattedBalance(this.state.balance)}
              </Text>
              <Text style={styles.balanceDesc}>Current Balance</Text>
            </View>
          )}
          <View style={styles.inputWrapper}>
            <View style={styles.inputWrapperLeft}>
              <Text style={styles.currencyLabel}>{this.state.currency}</Text>
            </View>
            <Input
              testID="add-cash-input"
              accessibilityLabel="add-cash-input"
              keyboardType="numeric"
              ref={ref => {
                this.amountInputRef = ref;
              }}
              value={this.state.amountToAdd}
              onChangeText={text => this.onChangeAmount(text)}
              onEndEditing={() => this.onChangeAmountEnd()}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
          </View>
          {this.state.notWholeNumber ? (
            <View style={styles.wholeNumberOnlyView}>
              <Text style={styles.wholeNumberText}>
                Please enter only a whole number
              </Text>
            </View>
          ) : null}
          {this.props.comparatorRates ? (
            <View style={styles.rateComparison}>
              <Text style={styles.rateComparisonTitle}>
                Compare our interest rate
              </Text>
              <View style={styles.rateComparisonBox}>
                <View style={styles.rateLine}>
                  <Text style={styles.rateComparisonJupiter}>
                    Jupiter Savings
                  </Text>
                  <Text style={styles.rateComparisonJupiter}>
                    {this.getReferenceRate()}%
                  </Text>
                </View>
                <View style={styles.rateComparisonSeparator} />
                {this.props.comparatorRates.rates
                  ? Object.keys(
                      this.props.comparatorRates.rates
                    ).map((item, index) => this.renderBankLine(item, index))
                  : null}
              </View>
            </View>
          ) : null}
        </ScrollView>
        <Button
          testID="add-cash-next-btn"
          accessibilityLabel="add-cash-next-btn"
          title="MAKE PAYMENT"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressAddCash}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  headerWrapper: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    paddingHorizontal: 5,
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
  headerTitleOnboarding: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    width: '100%',
    paddingLeft: 15,
  },
  onboardingTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    textAlign: 'left',
    width: '90%',
    marginTop: 25,
    marginBottom: -10,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    marginVertical: 15,
    justifyContent: 'center',
    width: '80%',
  },
  mainContent: {
    width: '100%',
  },
  mainContentContainer: {
    alignItems: 'center',
  },
  currentBalance: {
    marginTop: 20,
    alignItems: 'center',
  },
  balanceAmount: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 22,
  },
  balanceDesc: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 13,
    marginTop: -4,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '90%',
    height: 70,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PURPLE,
    borderRadius: 20,
    marginTop: 20,
  },
  inputWrapperLeft: {
    width: '13%',
    marginVertical: -1,
    marginLeft: -1,
    backgroundColor: Colors.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  currencyLabel: {
    fontFamily: 'poppins-regular',
    color: Colors.WHITE,
    fontSize: 24,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    marginLeft: 12,
    fontFamily: 'poppins-regular',
    fontSize: 35,
  },
  containerStyle: {
    width: '86%',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wholeNumberOnlyView: {
    marginTop: 20,
    alignItems: 'center',
  },
  wholeNumberText: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 13,
  },
  rateComparison: {
    width: '90%',
    marginVertical: 30,
  },
  rateComparisonTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    fontSize: 16,
    marginBottom: 10,
  },
  rateComparisonBox: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    paddingVertical: 20,
  },
  rateLine: {
    marginHorizontal: 20,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateComparisonSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.GRAY,
    marginVertical: 15,
  },
  rateComparisonJupiter: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    fontSize: 16,
  },
  rateComparisonBank: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
  },
});

export default connect(mapStateToProps)(AddCash);
