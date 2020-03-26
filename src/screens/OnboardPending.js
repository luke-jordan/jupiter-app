import React from 'react';
import { connect } from 'react-redux';

import { View, Image, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, AsyncStorage, Linking } from 'react-native';
import { Button, Overlay } from 'react-native-elements';

import { LinearGradient } from 'expo-linear-gradient';

import BankDetailDisplay from '../elements/BankDetailsDisplay';

import { Colors, Endpoints, FallbackBankDetails } from '../util/Values';

import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil} from '../util/NavigationUtil';
import { LogoutUtil } from '../util/LogoutUtil';

import { getConvertor } from '../util/AmountUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getOnboardStepsRemaining, getProfileData } from '../modules/profile/profile.reducer';
import { getCurrentTransactionDetails } from '../modules/transaction/transaction.reducer';

import { updateAllFields } from '../modules/profile/profile.actions';
import { updateCurrentTransaction } from '../modules/transaction/transaction.actions';

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  onboardStepsRemaining: getOnboardStepsRemaining(state),
  profileData: getProfileData(state),
  pendingSaveDetails: getCurrentTransactionDetails(state),
});

const mapDispatchToProps = {
  updateCurrentTransaction,
  updateWholeProfile: updateAllFields,
  clearState: () => LogoutUtil.logoutAction,
}

const STEPS_IN_ORDER = ['FAILED_VERIFICATION', 'AGREE_REGULATORY', 'ADD_CASH', 'FINISH_SAVE'];

class OnboardPending extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      personalName: this.props.profileData.personalName || 'Saver',
      checkingForStatus: false,
      loading: false,
    }
  }

  async componentDidMount() {
    // console.log('Profile data: ', this.props.profileData);
    const stateUpdate = { };
    
    if (this.props.navigation.getParam('stepToTake')) {
      stateUpdate.nextStep = this.props.navigation.getParam('stepToTake');
    }
    
    this.setState(stateUpdate);
  }

  fetchFullProfile = async (showModal = true) => {
    try {
      if (showModal) {
        this.setState({ checkingForStatus: true });
      }
      const result = await fetch(`${Endpoints.AUTH}profile/fetch`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'GET',
      });

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      await AsyncStorage.setItem('userInfo', JSON.stringify(resultJson));
      this.props.updateWholeProfile(resultJson);

      this.setState({ checkingForStatus: false });

      const { onboardStepsRemaining } = resultJson;
      if (!onboardStepsRemaining || onboardStepsRemaining.length === 0) {
        NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', { userInfo: resultJson });
        return;
      }

    } catch (err) {
      this.setState({ checkingForStatus: false });
      console.log('Error fetching profile: ', err);
      LoggingUtil.logError(err);
    }
  }

  onPressEditDetails = () => {
    this.props.navigation.navigate('Profile', { failedVerification: true });
  }

  renderPersonalDetails = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image 
          style={styles.innerHeaderIcon}
          source={require('../../assets/smile.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Check your details</Text>
      </View>
      <Text style={styles.innerDescription}>
        The ID number you provided did not match your name. Please double check the ID number and spelling of your name and retry.  
      </Text>
      <Button 
        title="EDIT MY DETAILS"
        onPress={this.onPressEditDetails}
        titleStyle={styles.nextStepButtonText}
        buttonStyle={styles.nextStepButton}
        containerStyle={styles.buttonContainer}
      />
    </>
  )

  onPressViewAgreement = () => {
    this.props.navigation.navigate('OnboardRegulation', { isOnboarding: true });
  };

  renderCompleteAgreement = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image
          style={styles.innerHeaderIcon}
          source={require('../../assets/check-circle.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Complete Agreement</Text>
      </View>
      <Text style={styles.innerDescription}>
        Read a quick agreement which lets you know how your savings will be invested in the best way possible. 
      </Text>
      <Button 
        title="VIEW AGREEMENT"
        titleStyle={styles.nextStepButtonText}
        buttonStyle={styles.nextStepButton}
        containerStyle={styles.buttonContainer}
        onPress={this.onPressViewAgreement}
      />
    </>
  );

  renderAddFirstSavings = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image
          style={styles.innerHeaderIcon}
          source={require('../../assets/check-circle.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Add your first savings</Text>
      </View>
      <Text style={styles.innerDescription}>
        Start your savings account with as much or as little as you like. As soon as we receive your funds you’ll start earning interest!  
      </Text>
      <Button 
        title="ADD SAVINGS"
        titleStyle={styles.nextStepButtonText}
        buttonStyle={styles.nextStepButton}
        containerStyle={styles.buttonContainer}
        onPress={() => this.props.navigation.navigate('OnboardAddSaving', { startNewTransaction: true })}
      />
    </>
  )

  tieUpSwitchToInstant = (resultJson) => {
    const { transactionId } = this.props.pendingSaveDetails;
    
    this.props.updateCurrentTransaction({
      paymentMethod: 'OZOW',
      urlToCompletePayment: resultJson.paymentRedirectDetails.urlToCompletePayment,
    });

    this.props.navigation.navigate('Payment', {
      transactionId,
      urlToCompletePayment: resultJson.paymentRedirectDetails.urlToCompletePayment,
      humanReference: resultJson.humanReference,
      amountToAdd: resultJson.amount,
      token: this.props.authToken,
    });
  }

  tieUpSwitchToManual = (resultJson) => {
    const { bankDetails } = resultJson;
    this.props.updateCurrentTransaction({
      paymentMethod: 'MANUAL_EFT',
      bankDetails,
    })
  }

  tellBackendToUpdate = async (paymentMethod, transactionId ) => {
    const parameters = { transactionId, paymentMethod };
    const result = await fetch(`${Endpoints.CORE}pending/update`, {
      headers: {
        Authorization: `Bearer ${this.props.authToken}`,
      },
      method: 'POST',
      body: JSON.stringify(parameters),
    });

    if (!result.ok) {
      throw result;
    }

    const resultJson = await result.json();
    return resultJson;
  }

  onPressSwitchPaymentMethod = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    try {
      const { paymentMethod, transactionId } = this.props.pendingSaveDetails;
      const isPriorInstant = paymentMethod === 'OZOW';
      
      LoggingUtil.logEvent(isPriorInstant ? 'USER_SWITCHED_TRANSFER_TO_MANUAL' : 'USER_SWITCHED_TRANSFER_TO_INSTANT');

      const newPaymentMethod = isPriorInstant ? 'MANUAL_EFT' : 'OZOW';
      const resultJson = await this.tellBackendToUpdate(newPaymentMethod, transactionId);
      this.setState({ loading: false });
      if (isPriorInstant) {
        this.tieUpSwitchToManual(resultJson);
      } else {
        this.tieUpSwitchToInstant(resultJson);
      }

    } catch (err) {
      console.log('Error switching payment method! : ', JSON.stringify(err));
      this.setState({ loading: false });
    }

  };

  onPressTryOzowAgain = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    try {
      const { transactionId, urlToCompletePayment } = this.props.pendingSaveDetails;
      if (urlToCompletePayment) {
        this.setState({ loading: false }, () => Linking.openURL(urlToCompletePayment));
      } else {
        const resultJson = await this.tellBackendToUpdate('OZOW', transactionId); // ensures we generate this
        this.setState({ loading: false }, () => Linking.openURL(resultJson.paymentRedirectDetails.urlToCompletePayment));
      }
    } catch (err) {
      console.log('Error trying Ozow again: ', JSON.stringify(err));
      this.setState({ loading: false });
    }
  };

  navigateToPaymentDone = (resultJson) => {
    let amountAdded = null;
    const { transactionAmount } = resultJson;
    if (transactionAmount) {
      amountAdded = transactionAmount.amount * getConvertor(transactionAmount.unit, 'WHOLE_CURRENCY');
    } else if (this.props.pendingSaveDetails.transactionAmount) {
      const priorAmount = this.props.pendingSaveDetails.transactionAmount;
      amountAdded = priorAmount.amount * getConvertor(priorAmount.unit, 'WHOLE_CURRENCY');
    }
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'PaymentComplete', {
      isOnboarding: true,
      newBalance: resultJson.newBalance,
      amountAdded,
    });
  }

  onPressCheckInstant = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true, checkingForStatus: true });

    try {
      const { transactionId } = this.props.pendingSaveDetails;
      const result = await fetch(`${Endpoints.CORE}addcash/check?transactionId=${transactionId}`, {
          headers: { Authorization: `Bearer ${this.props.authToken}` },
          method: 'GET',
        }
      );

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      this.setState({ loading: false, checkingForStatus: false });
      
      if (resultJson.result.includes('PAYMENT_SUCCEEDED')) {
        this.navigateToPaymentDone(resultJson);
      }

      // else : show message?
    } catch (error) {
      LoggingUtil.logEvent('PAYMENT_FAILED_UNKNOWN', { serverResponse: JSON.stringify(error) });
      this.setState({ checkingForStatus: false, loading: false });
    }
  }

  onPressCheckManual = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true, checkingForStatus: true });

    try {
      const { transactionId } = this.props.pendingSaveDetails;
      const result = await fetch(`${Endpoints.CORE}pending/check`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'POST',
        body: JSON.stringify({ transactionId }),
      });

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      const { result: checkResult } = resultJson;

      this.setState({ checkingForStatus: true, loading: true });

      if (['ADMIN_MARKED_PAID', 'PAYMENT_SUCCEEDED'].includes(checkResult)) {
        this.navigateToPaymentDone(resultJson);
      }

    } catch (err) {
      console.log('Error! : ', JSON.stringify(err));
      this.setState({ checkingForStatus: false, loading: false });
    }
  }

  onPressLogout = () => {
    this.props.clearState();
    LogoutUtil.logout(this.props.navigation);
  };

  onPressSupport = () => {
    this.props.navigation.navigate('Support', { originScreen: 'OnboardPending' });
  };

  renderCheckingOzow = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image
          style={styles.innerHeaderIcon}
          source={require('../../assets/money-8.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Checking for payment</Text>
      </View>
      <Text style={styles.innerDescription}>
        Sorry, we seem to be having some trouble finding your payment. Would you prefer to pay via manual EFT instead?
      </Text>
      <Button 
        title="PAY VIA EFT"
        loading={this.state.loading}
        onPress={this.onPressSwitchPaymentMethod}
        titleStyle={styles.paymentButtonText}
        buttonStyle={styles.paymentButton}
        containerStyle={styles.buttonContainer}
        linearGradientProps={{
          colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
        }}
      />
      <Button 
        title="TRY AGAIN WITH OZOW"
        loading={this.state.loading}
        onPress={this.onPressTryOzowAgain}
        titleStyle={styles.paymentButtonText}
        buttonStyle={styles.paymentButton}
        containerStyle={styles.buttonContainer}
        linearGradientProps={{
          colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
        }}
      />
      <TouchableOpacity
        onPress={this.onPressCheckInstant}
      >
        <Text style={styles.checkAgainText}>
          Check again if successful
        </Text>
      </TouchableOpacity>

    </>
  );

  renderPendingEFT = (saveDetails) => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image
          style={styles.innerHeaderIcon}
          source={require('../../assets/money-8.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Payment processing</Text>
      </View>
      <Text style={styles.innerDescription}>
        We are awaiting your payment by EFT. As soon as we receive the funds your account will be launched.
      </Text>
      <Text style={styles.innerDescription}>
        Don&apos;t want to wait?
      </Text>
      <Button 
        title="PAY VIA INSTANT EFT"
        loading={this.state.loading}
        onPress={this.onPressSwitchPaymentMethod}
        titleStyle={styles.paymentButtonText}
        buttonStyle={styles.paymentButton}
        containerStyle={styles.buttonContainer}
        linearGradientProps={{
          colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
        }}
      />
      <BankDetailDisplay
        containerStyle={{ maxWidth: '100%', marginTop: 15 }}
        bankDetails={(saveDetails && saveDetails.bankDetails) || FallbackBankDetails}
        amountToAdd={saveDetails.transactionAmount ? saveDetails.transactionAmount.amount * getConvertor(saveDetails.transactionAmount.unit, 'WHOLE_CURRENCY') : null}
        humanReference={saveDetails.humanReference}
        onCheckDone={this.onPressCheckManual}
      />
    </>
  );

  renderFinishSave = () => {
    if (!this.props.pendingSaveDetails || !this.props.pendingSaveDetails.transactionId) {
      return this.renderAddFirstSavings(); // in case lose track, best option is to start again
    }
    
    const { paymentMethod } = this.props.pendingSaveDetails;
    if (paymentMethod === 'OZOW') {
      return this.renderCheckingOzow();
    }

    return this.renderPendingEFT(this.props.pendingSaveDetails);
  }

  renderNextStep() {
    let renderFunction = () => (<Text>Loading...</Text>);
    
    const serviceMap = {
      'FAILED_VERIFICATION': this.renderPersonalDetails,
      'AGREE_REGULATORY': this.renderCompleteAgreement,
      'ADD_CASH': this.renderAddFirstSavings,
      'FINISH_SAVE': this.renderFinishSave,
    };

    if (this.state.nextStep) {
      renderFunction = serviceMap[this.state.nextStep];
    } else {
      const { onboardStepsRemaining } = this.props;
      const earliestStep = STEPS_IN_ORDER.find((step) => onboardStepsRemaining.includes(step));
      renderFunction = earliestStep ? serviceMap[earliestStep] : renderFunction; 
    }

    return (
      <View>
        {renderFunction()}
      </View>
    )
  }

  render() {
    return (
      <LinearGradient
        colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
        start={[0.5, 0]}
        end={[0.5, 1]}
        style={styles.gradientContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.headerText}>
            Hello, <Text style={styles.headerTextName}>{this.state.personalName}</Text>
          </Text>
          <Image
            source={require('../../assets/onboard_rocket.png')}
            style={styles.rocketImage}
            resizeMode="contain"
          />
          <Text style={styles.subText}>
            Get ready to grow your savings and start earning returns
          </Text>
          <Text style={styles.launchAccountText}>
            TO LAUNCH YOUR ACCOUNT:
          </Text>
          <View style={styles.nextStepContainer}>
            {this.renderNextStep()}
          </View>
          <View style={styles.footerContainer}>
            <View style={styles.footerWrapper}>
              <Text style={styles.footerTitle}>
                Were you expecting to see something different?
              </Text>
              <View style={styles.footerInner}>
                <Text style={styles.footerLink} onPress={this.onPressLogout}>
                  Logout
                </Text>
                <Text style={{ color: Colors.WHITE }}>|</Text>
                <Text style={styles.footerLink} onPress={this.onPressSupport}>
                  Support
                </Text>
                <Text style={{ color: Colors.WHITE }}>|</Text>
                <Text style={styles.footerLink} onPress={this.fetchFullProfile}>
                  Check again
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <Overlay
          isVisible={this.state.checkingForStatus}
          height="auto"
          width="auto"
          onBackdropPress={() => {}}
          onHardwareBackPress={() => {
            this.setState({ checkingForStatus: false });
            return true;
          }}
        >
          <View style={styles.dialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.dialogText}>
              Checking server...
            </Text>
          </View>
        </Overlay>
      </LinearGradient>
    );
  }

}

const styles = StyleSheet.create({
  gradientContainer: {
    minHeight: '100%',
    minWidth: '100%',
    alignItems: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
    minHeight: '100%',
    minWidth: '100%',
  },
  headerText: {
    fontFamily: 'poppins-regular',
    fontSize: 24,
    textAlign: 'center',
    color: Colors.WHITE,
    width: '100%',
    marginTop: 10,
  },
  headerTextName: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
  },
  rocketImage: {
    marginTop: 16,
    width: 122,
    height: 97,
  },
  subText: {
    marginTop: 20,
    fontFamily: 'poppins-regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: Colors.WHITE,
    paddingHorizontal: 25,
  },
  launchAccountText: {
    marginTop: 20,
    fontFamily: 'poppins-semibold',
    fontSize: 12,
    color: Colors.WHITE,
    width: '100%',
    textAlign: 'left',
    paddingHorizontal: 15,
  },
  nextStepContainer: {
    marginTop: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  // eslint-disable-next-line react-native/no-color-literals
  footerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 20,
  },
  footerTitle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.WHITE,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  footerInner: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLink: {
    textAlign: 'center',
    paddingHorizontal: 10,
    color: Colors.WHITE,
    fontFamily: 'poppins-semibold',
    fontSize: 12,
  },
  innerHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  innerHeaderIcon: {
    tintColor: Colors.PURPLE,
    width: 20,
    height: 20,
    marginEnd: 10,
  },
  innerHeaderText: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  innerDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 5,
    color: Colors.MEDIUM_GRAY,
  },
  buttonContainer: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepButton: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.PURPLE,
    borderWidth: 2,
    borderRadius: 4,
    width: 210,
  },
  nextStepButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PURPLE,
  },
  checkAgainText: {
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'poppins-regular',
    fontSize: 14,
    textAlign: 'center',
    minWidth: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  paymentButton: {
    width: 210,
    borderRadius: 4,
    paddingVertical: 10,
  },
  paymentButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  dialogWrapper: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  dialogText: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    textAlign: 'center',
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(OnboardPending);
