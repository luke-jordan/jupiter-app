import React from 'react';
import { connect } from 'react-redux';

import { View, Text, Image, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { Input, Icon } from 'react-native-elements';

import OnboardBreadCrumb from '../elements/OnboardBreadCrumb';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { updateCurrentTransaction, clearCurrentTransaction } from '../modules/transaction/transaction.actions';

import { Colors, Endpoints } from '../util/Values';
import { getDivisor } from '../util/AmountUtil';

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
});

const mapDispatchToProps = {
  updateCurrentTransaction,
  clearCurrentTransaction,
};

class OnboardAddSaving extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: 'R',
      amountToAdd: '',
      notWholeNumber: false,
      emptyAmountError: false,
      loadingInstant: false,
      loadingManual: false,
    }
  }

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

  isNoAmount = () => this.state.amountToAdd.trim().length === 0;

  onPressInstantEft = async () => {
    if (this.state.loadingInstant || this.state.loadingManual) return;
    
    if (this.isNoAmount()) {
      this.setState({ emptyAmountError: true });
      return;
    }

    this.setState({ loadingInstant: true });
    const resultOfCall = await this.tellBackendToInitiate('OZOW');
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
    if (this.state.loadingManual || this.state.loadingInstant) return;

    if (this.isNoAmount()) {
      this.setState({ emptyAmountError: true });
      return;
    }

    this.setState({ loadingInstant: true });
    // const resultOfCall = await this.tellBackendToInitiate('MANUAL_EFT');
    // const resultOfCall = true;
    this.setState({ loadingManual: false });

    this.props.navigation.navigate('OnboardPending', {
      stepToTake: 'FINISH_SAVE',
    });

    // if (resultOfCall) {
    //   this.props.navigation.navigate('EFTPayment', {
    //     amountToAdd: this.state.amountToAdd,
    //     token: this.props.authToken,
    //     isOnboarding: this.state.isOnboarding,
    //     transactionId: resultOfCall.transactionId,
    //     humanReference: resultOfCall.humanReference,
    //     bankDetails: resultOfCall.bankDetails,
    //   });
    // }
  }

  tellBackendToInitiate = async (paymentMethod) => {
    try {
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
        }),
      });

      if (result.ok) {
        const resultJson = await result.json();
        if (this.state.isOnboarding) {
          NavigationUtil.removeOnboardStepRemaining('ADD_CASH');
        }

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


  render() {
    return (
      <KeyboardAvoidingView behavior="position">
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>Step 4 of 4</Text>
        </View>
        <ScrollView style={{ height: '100%' }}>
          <OnboardBreadCrumb currentStep="ADD_SAVINGS" />
          <Text style={styles.contentHeader}>
            You&apos;re almost there!
          </Text>
          <Text style={styles.contentBody}>
          Now’s the time to activate your savings by transferring as much or as little money as you like. 
          Remember that you can top-up at any time and there is no minimum amount.
          </Text>
          <View style={styles.inputBody}>
            <Text style={styles.inputLabel}>Add Savings</Text>
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
            {!this.state.notWholeNumber && !this.state.emptyAmountError && <Text style={styles.footnoteText}>* no minimum required</Text>}
            {this.state.notWholeNumber && <Text style={styles.errorText}>Please enter a whole number</Text>}
            {this.state.emptyAmountError && <Text style={styles.errorText}>Please enter an amount to continue</Text>}

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
                <Text style={styles.optionSubtitle}>Safe &amp; secure instant transfer</Text>
              </View>
              <View style={styles.optionChevronWrapper}>
                <Icon
                  name="chevron-right"
                  type="evilicon"
                  size={40}
                  color={Colors.MEDIUM_GRAY}
                />
              </View>
            </TouchableOpacity>

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
                <Text style={styles.optionSubtitle}>2-3 working days to reflect</Text>
              </View>
              <View style={styles.optionChevronWrapper}>
                <Icon
                  name="chevron-right"
                  type="evilicon"
                  size={40}
                  color={Colors.MEDIUM_GRAY}
                />
              </View>
            </TouchableOpacity>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  stepText: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.DARK_GRAY,
  },
  contentHeader: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 15,
    color: Colors.DARK_GRAY,
  },
  contentBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 22,
    width: '100%',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
    color: Colors.MEDIUM_GRAY,
  },
  inputBody: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.BACKGROUND_GRAY,
    paddingHorizontal: 15,
    marginTop: 20,
    paddingBottom: 50,
    marginBottom: 50,
  },
  inputLabel: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    color:Colors.DARK_GRAY,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '90%',
    height: 70,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PURPLE,
    borderRadius: 20,
    marginTop: 10,
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
  footnoteText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    marginTop: 5,
    paddingLeft: 2,
    color: Colors.MEDIUM_GRAY,
  },
  errorText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    marginTop: 5,
    paddingLeft: 2,
    color: Colors.RED,
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
  optionChevronWrapper: { 
    flexGrow: 10, 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    flexDirection: 'row',
    paddingRight: 5,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OnboardAddSaving);