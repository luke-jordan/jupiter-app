import React from 'react';
import { connect } from 'react-redux';

import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { Colors, Endpoints } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';

import { getCurrentTransactionDetails } from '../modules/transaction/transaction.reducer';
import { updateCurrentTransaction } from '../modules/transaction/transaction.actions';
import { getDivisor, getConvertor } from '../util/AmountUtil';

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  transactionDetails: getCurrentTransactionDetails(state),
});

const mapDispatchToProps = {
  updateCurrentTransaction,
};

class SelectTransferMethod extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isOnboarding: false,
      amountToAdd: 0,
      loadingInstant: false,
      loadingManual: false,
    };
    
  }

  componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_SELECT_PAYMENT_METHOD');
    const { params } = this.props.navigation.state;
    this.setState({
      amountToAdd: params.amountToAdd,
      isOnboarding: params.isOnboarding,
      accountId: params.accountId,
    });
    console.log('What we have : ', this.props.transactionDetails);
  }

  onPressInstantEft = async () => {
    if (this.state.loadingInstant || this.state.loadingManual) return true;

    LoggingUtil.logEvent('USER_SELECTED_INSTANT_EFT');

    this.setState({ loadingInstant: true});
    const resultOfCall = await this.initiateOrUpdateTransaction('OZOW');
    console.log('Result of call: ', JSON.stringify(resultOfCall));
    this.setState({ loadingInstant: false });
    
    if (resultOfCall) {
      this.props.navigation.navigate('Payment', {
        urlToCompletePayment: resultOfCall.urlToCompletePayment,
        transactionId: resultOfCall.transactionId,
        humanReference: resultOfCall.humanReference,
        token: this.props.authToken,
        isOnboarding: this.state.isOnboarding,
        amountToAdd: this.state.amountToAdd,
      });
    }
  }

  onPressManualEft = async () => {
    if (this.state.loadingManual || this.state.loadingInstant) return true;

    LoggingUtil.logEvent('USER_SELECTED_MANUAL_EFT');

    this.setState({ loadingManual: true });
    const resultOfCall = await this.initiateOrUpdateTransaction('MANUAL_EFT');
    this.setState({ loadingManual:  false});

    if (resultOfCall) {
      this.props.navigation.navigate('EFTPayment', {
        amountToAdd: this.state.amountToAdd,
        token: this.props.authToken,
        isOnboarding: this.state.isOnboarding,
        transactionId: resultOfCall.transactionId,
        humanReference: resultOfCall.humanReference,
        bankDetails: resultOfCall.bankDetails,
      });
    }
  }

  initiateOrUpdateTransaction = async (paymentMethod) => {
    const { transactionId, transactionType } = this.props.transactionDetails;
    console.log('Initiating or updating transaction, details : ', this.props.transactionDetails);
    // console.log(`TransactionId ? : ${transactionId} and `)
    let resultOfCall = {};
    if (transactionId && transactionType === 'USER_SAVING_EVENT') {
      resultOfCall = await this.tellBackendToUpdate(paymentMethod);
    } else {
      resultOfCall = await this.tellBackendToInitiate(paymentMethod);
    }
    console.log('Completed backend calls, result: ', JSON.stringify(resultOfCall));
    return resultOfCall;
  };


  assembleTags = () => {
    const tags = [];
    const { savingPoolId, messageInstructionId, boostId } = this.props.transactionDetails;
    if (savingPoolId) {
      tags.push(`SAVING_POOL::${savingPoolId}`);
    }
    if (messageInstructionId) {
      tags.push(`MESSAGE_INSTRUCTION::${messageInstructionId}`);
    }
    if (boostId) {
      tags.push(`BOOST::${boostId}`);
    }
    return tags;
  }

  tellBackendToInitiate = async (paymentMethod) => {
    try {
      const transactionTags = this.assembleTags();
      const result = await fetch(`${Endpoints.CORE}addcash/initiate`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'POST',
        body: JSON.stringify({
          accountId: this.state.accountId,
          amount: this.state.amountToAdd * getDivisor('HUNDREDTH_CENT'), // multiplying by 100 to get cents and again by 100 to get hundreth cent
          currency: 'ZAR', // TODO implement for handling other currencies
          unit: 'HUNDREDTH_CENT',
          paymentProvider: paymentMethod,
          tags: transactionTags,
        }),
      });

      if (result.ok) {
        const resultJson = await result.json();

        this.props.updateCurrentTransaction({
          transactionId: resultJson.transactionDetails[0].accountTransactionId,
          transactionType: 'USER_SAVING_EVENT',
          humanReference: resultJson.humanReference,
          paymentMethod,
        });

        return {
          transactionId: resultJson.transactionDetails[0].accountTransactionId,
          humanReference: resultJson.humanReference,
          bankDetails: resultJson.bankDetails,
          urlToCompletePayment: resultJson.paymentRedirectDetails ? resultJson.paymentRedirectDetails.urlToCompletePayment : '',
        };

      } else {
        throw result;
      }
      
    } catch (error) {
      console.log('Add cash failed: ', error);
      LoggingUtil.logEvent('ADD_CASH_FAILED_UNKNOWN', {
        serverResponse: JSON.stringify(error.message),
      });
      this.setState({ loadingInstant: false, loadingManual: false });
      // this.showError();
    }      
  }

  tellBackendToUpdate = async (paymentMethod) => {
    try {
      console.log('UPDATING TRANSACTION ....');
      const { transactionId, transactionAmount: wholeAmount } = this.props.transactionDetails;
      const multiplier = getConvertor(wholeAmount.unit, 'HUNDREDTH_CENT');
      const transactionAmount = { amount: wholeAmount.amount * multiplier, unit: 'HUNDREDTH_CENT', currency: wholeAmount.currency };

      const result = await fetch(`${Endpoints.CORE}pending/update`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'POST',
        body: JSON.stringify({
          transactionId,
          amount: transactionAmount,
          paymentMethod,
        }),
      });

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      console.log('Raw backend: ', resultJson);
      this.props.updateCurrentTransaction({
        paymentMethod,
      });

      return {
        transactionId,
        humanReference: resultJson.humanReference,
        bankDetails: resultJson.bankDetails,
        urlToCompletePayment: resultJson.paymentRedirectDetails ? resultJson.paymentRedirectDetails.urlToCompletePayment : '',
      };

    } catch (error) {
      console.log('Failure in update: ', JSON.stringify(error));
      LoggingUtil.logEvent('ADD_CASH_FAILED_UNKNOWN', { serverResponse: JSON.stringify(error.message) });
      this.setState({ loadingInstant: false, loadingManual: false });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={45}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transfer Method</Text>
        </View>
        <View style={styles.mainContent}>
          <TouchableOpacity 
            style={styles.optionBox} 
            onPress={this.onPressInstantEft} 
            loading={this.state.loadingInstant}
            disabled={this.state.loadingManual}
          >
            <Image
              style={styles.optionImage}
              source={require('../../assets/ozow-icon.png')}
            />
            <View style={styles.optionTextBox}>
              <Text style={this.state.loadingManual ? styles.optionTitleDisabled : styles.optionTitle}>
                { this.state.loadingInstant ? 'LOADING...' : 'PAY WITH OZOW' }
              </Text>
              <Text style={styles.optionSubtitle}>Safe and secure instant transfer</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bulletBox}>
            <View style={styles.bulletItem}>
              <Icon name="check" type="feather" size={19} color={Colors.GREEN} />
              <Text style={styles.bulletText}>
                No registration or app download required
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check" type="feather" size={19} color={Colors.GREEN} />
              <Text style={styles.bulletText}>
                Payments completed in minutes
              </Text>
            </View>    
            <View style={styles.bulletItem}>
              <Icon name="check" type="feather" size={19} color={Colors.GREEN} />
              <Text style={styles.bulletText}>
                No banking login details stored
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check" type="feather" size={19} color={Colors.GREEN} />
              <Text style={styles.bulletText}>
                Works with the 8 largest SA banks
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.optionBox} 
            onPress={this.onPressManualEft} 
            loading={this.state.loadingManual}
            disabled={this.state.loadingInstant}
          >
            <Image
              style={styles.optionImage}
              source={require('../../assets/eft-positive.png')}
            />
            <View style={styles.optionTextBox}>
              <Text style={this.state.loadingInstant ? styles.optionTitleDisabled : styles.optionTitle}>
                { this.state.loadingManual ? 'LOADING...' : 'MANUAL EFT' }
              </Text>
              <Text style={styles.optionSubtitle}>EFTs take 2-3 working days to reflect</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bulletBox}>
            <View style={styles.bulletItem}>
              <Icon name="check" type="feather" size={19} color={Colors.GREEN} />
              <Text style={styles.bulletText}>
                Transfer cash when you can
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check" type="feather" size={19} color={Colors.GREEN} />
              <Text style={styles.bulletText}>
                Use your normal EFT process
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check" type="feather" size={19} color={Colors.GREEN} />
              <Text style={styles.bulletText}>
                Works with all South African banks
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    padding: 6,
  },
  headerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  optionBox: {
    marginTop: 20,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    shadowColor: Colors.BLACK,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  optionImage: {
    marginStart: 20,
    width: 29,
    height: 29,
  },
  optionTextBox: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 15,
  },
  optionTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
  },
  optionTitleDisabled: {
    fontFamily: 'poppins-regular',
    fontSize: 16,
    color: Colors.GRAY,
  },
  optionSubtitle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
  },
  bulletBox: {
    marginTop: 15,
    width: '100%',
  },
  bulletItem: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  bulletText: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
    marginLeft: 5,
    paddingRight: 10,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectTransferMethod);
