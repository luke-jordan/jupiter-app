import React from 'react';
import { connect } from 'react-redux';

import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import { Button, Overlay } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { Colors, Endpoints } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { updateAuthToken, removeAuthToken } from '../modules/auth/auth.actions';
import { NavigationUtil } from '../util/NavigationUtil';

import OnboardBreadCrumb from '../elements/OnboardBreadCrumb';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
});

const mapDispatchToProps = {
  updateAuthToken,
  removeAuthToken,
};

class OnboardRegulation extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      isAborting: false,
    }
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_REGULATORY_ONBOARD');
    const { params } = this.props.navigation.state;
    if (params) {
      const { userInfo } = params;

      if (!this.props.authToken) {
        const token = params.token || (userInfo && userInfo.token);
        this.props.updateAuthToken(token);  
      }

      let { accountId } = params;
      if (!accountId && userInfo && userInfo.balance) {
        [accountId] = userInfo.balance.accountId;
      }

      this.setState({
        isOnboarding: params.isOnboarding,
        accountId,
      });

    } else {
      this.setState({
        isOnboarding: false,
      })
    }
  }

  onPressAgree = async () => {
    this.props.navigation.navigate('OnboardAddSaving');
    // try {
    //   // console.log('SENDING AGREEMENT');
    //   this.setState({ loading: true });
      
    //   const result = await fetch(`${Endpoints.AUTH}profile/update`, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Accept: 'application/json',
    //       Authorization: `Bearer ${this.props.authToken}`,
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({
    //       regulatoryStatus: 'HAS_GIVEN_AGREEMENT',
    //     }),
    //   });

    //   // console.log('Raw result: ', JSON.stringify(result));
    //   if (!result.ok) {
    //     throw result;
    //   }

    //   await this.onCompleteAgreement();
    // } catch (err) {
    //   this.setState({ loading: false });
    //   console.log('Result: ', JSON.stringify(err));
    // }
  };

  onCompleteAgreement = async () => {
    if (this.state.isOnboarding) {
      this.setState({ loading: false });
      NavigationUtil.removeOnboardStepRemaining('AGREE_REGULATORY');
      this.props.navigation.navigate('AddCash', {
        isOnboarding: true,
        token: this.props.authToken,
        accountId: this.state.accountId,
        startNewTransaction: true,
      });
    } else {
      const updatedProfileRaw = await fetch(`${Endpoints.AUTH}profile/fetch`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'GET',
      });
      const updatedProfile = await updatedProfileRaw.json();
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedProfile));
      this.setState({ loading: false });
      this.props.navigation.navigate('Home');
    }
  }

  onPressAbort = () => {
    LoggingUtil.logEvent('USER_CONSIDERED_ABORT_REGULATORY');
    this.setState({ isAborting: true });
  };

  onPressAbortClose = () => {
    this.setState({ isAborting: false });
  };

  onPressConfirmAbort = async () => {
    this.setState({ loading: true });
    LoggingUtil.logEvent('USER_CONFIRMED_ABORT_REGULATORY');
    await Promise.all([AsyncStorage.removeItem('userInfo'), AsyncStorage.removeItem('userHistory')]);
    this.props.removeAuthToken();
    this.setState({ isAborting: false, loading: false });
    this.props.navigation.navigate('Login');
  }

  onPressViewStokvelConst = () => {
    LoggingUtil.logEvent('USER_VIEWED_STOKVEL_ON_REGULATORY');
    this.props.navigation.navigate('Stokvel');
  };

  render() {

    return (
      <View style={styles.container}>
        <View style={styles.stepContainer}><Text style={styles.stepText}>Step 3 of 4</Text></View>
        <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollContainer}>
          <OnboardBreadCrumb currentStep="AGREEMENT" />
          <Image 
            style={styles.headerImage}
            source={require('../../assets/regulatory.png')}
          />
          <Text style={styles.headerText}>
            Hi there,
          </Text>
          <Text style={styles.subHeaderText}>
            You are agreeing to join the Jupiter Stokvel, a group of like-minded people, focused on building our wealth.
          </Text>
          <View style={styles.mandateBlock}>
            <Text style={styles.mandateText}>
              You&apos;ll be using the secure Jupiter App to earn inflation beating returns, with our savings invested safely in 
              the <Text style={styles.mandateManager}>Allan Gray</Text> Money Market fund.
            </Text>
            <TouchableOpacity style={styles.linkContainer} onPress={this.onPressViewStokvelConst}>
              <Text style={styles.linkConstitution}>
                View the Stokvel Constitution
              </Text>
            </TouchableOpacity>
          </View>
          <Button
            testID="agree-regulations-button"
            accessibilityLabel="agree-regulations-button"
            title="YES, I AGREE"
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressAgree}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
          <Text style={styles.exitLinkText} onPress={this.onPressAbort}>
            No, I’m not sure anymore, take me out
          </Text>
        </ScrollView>

        {this.state.isAborting && (
          <Overlay
            animationType="fade"
            height="auto"
            width="auto"
            isVisible={this.state.isAborting}
            onBackdropPress={this.onPressAbortClose}
            onHardwareBackPress={this.onPressAbortClose}
          >
            <View style={styles.dialogView}>
              <View style={styles.dialogHeader}>
                <Text style={styles.dialogTitle}>Abort signup?</Text>
                <TouchableOpacity onPress={this.onPressAbortClose} style={styles.closeDialog}>
                  <Image source={require('../../assets/close.png')} />
                </TouchableOpacity>
              </View>
              <View style={styles.dialogBodyContainer}>
                <Text style={styles.dialogBodyText}>
                  Unfortunately you won&apos;t be able to continue if you don&apos;t agree. 
                  However, your login details will remain, so you can always login again and
                  come back here if you change your mind.
                </Text>
                <Button
                  title="TAKE ME OUT"
                  loading={this.state.loading}
                  titleStyle={styles.buttonTitleStyle}
                  buttonStyle={styles.buttonStyle}
                  containerStyle={styles.dialogButtonContainerStyle}
                  onPress={this.onPressConfirmAbort}
                  linearGradientProps={{
                    colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                    start: { x: 0, y: 0.5 },
                    end: { x: 1, y: 0.5 },
                  }}
                />
                <TouchableOpacity style={styles.returnToMainContainer} onPress={this.onPressAbortClose}>
                  <Text style={styles.returnText}>
                    Actually I changed my mind, let me look again
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>
        )}

      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    paddingHorizontal: 10,
    backgroundColor: Colors.WHITE,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  stepText: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.DARK_GRAY,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    marginVertical: 25,
  },
  headerText: {
    fontFamily: 'poppins-semibold',
    fontSize: 7.2 * FONT_UNIT,
    lineHeight: 10 * FONT_UNIT,
    color: Colors.DARK_GRAY,
    marginBottom: 10,
  },
  subHeaderText: {
    fontFamily: 'poppins-regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.MEDIUM_GRAY,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  mandateBlock: {
    borderRadius: 10,
    backgroundColor: Colors.BACKGROUND_GRAY,
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandateText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
  },
  mandateManager: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
  },
  linkContainer: {
    paddingTop: 15,
    paddingBottom: 8,
  },
  linkConstitution: {
    fontFamily: 'poppins-semibold',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.PURPLE,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    flex: 1,
    marginTop: 30,
    marginBottom: 15,
    justifyContent: 'center',
    width: '80%',
  },
  exitLinkText: {
    fontFamily: 'poppins-semibold',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.PURPLE,
    paddingBottom: 10,
  },
  dialogView: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingHorizontal: 10,
    maxWidth: '90%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    color: Colors.DARK_GRAY,
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 25, // to leave space for cross
  },
  dialogBodyContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dialogBodyText: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 15,
    textAlign: 'center',
  },
  returnToMainContainer: {
    paddingTop: 10,
  },
  returnText: {
    fontFamily: 'poppins-semibold',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.PURPLE,
  },
  dialogButtonContainerStyle: {
    marginTop: 10,
    marginBottom: 5,
    justifyContent: 'center',
    width: '80%',
  },
  closeDialog: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OnboardRegulation);