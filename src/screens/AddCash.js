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

import { Colors } from '../util/Values';
import { LoggingUtil } from '../util/LoggingUtil';
import { getDivisor, standardFormatAmount  } from '../util/AmountUtil';

import { getAccountId } from '../modules/profile/profile.reducer';
import { getCurrentServerBalanceFull, getComparatorRates } from '../modules/balance/balance.reducer';

import { clearCurrentTransaction, updateCurrentTransaction } from '../modules/transaction/transaction.actions';

const mapStateToProps = state => ({
  accountId: getAccountId(state),
  comparatorRates: getComparatorRates(state),
  currentBalance: getCurrentServerBalanceFull(state),
});

const mapDispatchToProps = {
  updateCurrentTransaction,
  clearCurrentTransaction,
};

class AddCash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: 'R',
      balance: 0,
      amountToAdd: '',
      loading: false,
      notWholeNumber: false,
    };
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state;

    if (params && params.startNewTransaction) {
      this.props.clearCurrentTransaction(); // i.e., we start again
    }

    // eslint-disable-next-line prefer-const
    const lastSaveAmount = await  AsyncStorage.getItem('lastSaveAmount');
    this.setState({
      balance: this.props.currentBalance.amount,
      unit: this.props.currentBalance.unit,
    });

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

    // at the moment, these three are mutually exclusive, so will not have multiple calls
    if (params.savingPoolId) {
      this.props.updateCurrentTransaction({ savingPoolId: params.savingPoolId });
    }

    if (params.messageInstructionId) {
      this.props.updateCurrentTransaction({ messageInstructionId: params.messageInstructionId });
    }

    if (params.boostId) {
      this.props.updateCurrentTransaction({ boostId: params.boostId });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  // eslint-disable-next-line react/sort-comp
  transitionToTransferMethod = () => {
    this.props.updateCurrentTransaction({
      transactionAmount: {
        amount: this.state.amountToAdd,
        currency: 'ZAR',
        unit: 'WHOLE_CURRENCY',
      },
    });

    LoggingUtil.logEvent('USER_INITIATED_ADD_CASH', {
      amountAdded: this.state.amountToAdd,
    });

    AsyncStorage.setItem('lastSaveAmount', parseFloat(this.state.amountToAdd).toFixed(0));
    this.setState({ loading: false }, () => {
      this.props.navigation.navigate('SelectTransferMethod', { 
        amountToAdd: this.state.amountToAdd, 
        accountId: this.props.accountId, 
      });
    })
  }

  onPressAddCash = async () => {
    if (this.state.loading) return;
    
    if(this.state.amountToAdd.trim().length === 0) {
      this.setState({ emptyAmountError: true });
      return;
    }

    this.setState({ loading: true }, () => this.transitionToTransferMethod());
  };

  onChangeAmount = text => {
    if (['NA', 'NAN'].includes(text.trim().toUpperCase())) {
      this.setState({
        amountToAdd: '',
        notWholeNumber: false,
      });
      return;
    }

    const wholeNumberRegex = /^[0-9\b]+$/;
    if (wholeNumberRegex.test(text) || text.trim().length === 0) {
      this.setState({
        amountToAdd: text,
        notWholeNumber: false,
        emptyAmountError: false,
      });
    } else {
      this.setState({
        notWholeNumber: true,
      });
    }
  };

  onChangeAmountEnd = () => {
    if (this.state.amountToAdd.trim().length > 0) {
      this.setState({
        amountToAdd: parseFloat(this.state.amountToAdd).toFixed(0),
      });
    }
    this.amountInputRef.blur();
  };

  getFormattedBalance(balance) {
    return (balance / getDivisor(this.state.unit)).toFixed(2);
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
    if (this.props.comparatorRates && this.props.comparatorRates.referenceRate) {
      return parseFloat(this.props.comparatorRates.referenceRate / 100).toFixed(2);
    }

    return '';
  }

  getProjectedAmountNumber() {
    if (!this.props.comparatorRates.referenceRate) {
      return 0;
    }

    if (!this.state.amountToAdd || this.state.amountToAdd.trim().length === 0) {
      return 0;
    }
    
    const relevantAmount = parseInt(this.state.amountToAdd, 10);
    const referenceRate = parseFloat(this.props.comparatorRates.referenceRate / (100 * 100)); // rate is in bps, need as 0-1
    const projectedAmount = relevantAmount * ((1 + referenceRate) ** 1 - 1); // removing "5 year" but keeping the formula
    
    return projectedAmount;
  }

  getProjectedAmountText() {
    const unit = 'WHOLE_CURRENCY';
    const currency = 'ZAR';

    return standardFormatAmount(this.getProjectedAmountNumber(), unit, currency, 2);
  }

  renderHeader() {
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
        <Text style={styles.headerTitle}>Add Savings</Text>
      </View>
    );
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
          <View style={styles.currentBalance}>
            <Text style={styles.balanceAmount}>
              {this.state.currency}
              {this.getFormattedBalance(this.state.balance)}
            </Text>
            <Text style={styles.balanceDesc}>Current Balance</Text>
          </View>
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
          {this.state.emptyAmountError && (
            <View style={styles.wholeNumberOnlyView}>
              <Text style={styles.error}>
                Please enter an amount to proceed
              </Text>
            </View>
          )}
          {this.props.comparatorRates && this.getProjectedAmountNumber() >= 1 ? (
            <Text style={styles.moneyGrowth}>
              This save pays you <Text style={styles.boldAmount}>{this.getProjectedAmountText()}</Text> each year!
            </Text>
          ) : null}
          {this.props.comparatorRates ? (
            <View style={styles.rateComparison}>
              <Text style={styles.rateComparisonTitle}>
                Wondering if you&apos;re getting a GOOD rate?{'\n'}
                Use the <Text style={styles.boldText}>Rate Comparer</Text> below to compare rates (on savings you can withdraw tomorrow)
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
          title="ADD SAVINGS"
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
    fontSize: 18,
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
    marginTop: 15,
    alignItems: 'center',
  },
  wholeNumberText: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 13,
  },
  error: {
    color: Colors.RED,
  },
  moneyGrowth: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    marginVertical: 10,
  },
  boldText: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  rateComparison: {
    width: '90%',
    marginVertical: 15,
  },
  rateComparisonTitle: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'center',
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
    fontSize: 15,
  },
  rateComparisonBank: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddCash);
