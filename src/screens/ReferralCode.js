import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Share, KeyboardAvoidingView } from 'react-native';
import { Overlay, Button, Input, Icon } from 'react-native-elements';

import HeaderWithBack from '../elements/HeaderWithBack';

import { Colors, Endpoints } from '../util/Values';
import { safeFormatStringOrDict } from '../util/AmountUtil';

import { LoggingUtil } from '../util/LoggingUtil';
import { friendService } from '../modules/friend/friend.service';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { postRequest } from '../modules/auth/auth.helper';

import { getProfileData } from '../modules/profile/profile.reducer';
import { getReferralData } from '../modules/friend/friend.reducer';

const mapStateToProps = state => ({
  token: getAuthToken(state),
  profile: getProfileData(state),
  referralData: getReferralData(state),
});

class ReferralCode extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,

      referralCode: this.props.profile.referralCode,
      referralCodeToUse: '',

      codeSubmissionError: '',
    };
  }

  async componentDidMount() {
    this.onLoadFetchCodeStatus();
    LoggingUtil.logEvent('USER_OPENED_REFERRAL_SCREEN');
  }

  onLoadFetchCodeStatus = async () => {
    try {
      const url = `${Endpoints.CORE}referral/use`;
      const params = { obtainReferralData: true };
      const referralResponse = await postRequest({ token: this.props.token, url, params });
      if (!referralResponse.ok) {
        throw referralResponse;
      }

      const referralData = await referralResponse.json();
      
      const { canUseReferralCode, hasUsedReferralCode, boostOnOffer, referralBonusData: rawBonusData } = referralData;
      const newState = { canUseReferralCode, hasUsedReferralCode, boostOnOffer };
      
      if (hasUsedReferralCode) {
        newState.referralCodeUsed = this.props.referralCodeUsed;
      }

      if (!this.state.referralCode) {
        newState.referralCode = referralData.userReferralCode;
      }

      if (boostOnOffer && rawBonusData) {
        const referralBonusData = {
          daysToMaintain: rawBonusData.daysToMaintain,
          boostBalanceRequirement: safeFormatStringOrDict(rawBonusData.redeemConditionAmount),
          boostAmount: safeFormatStringOrDict(rawBonusData.boostAmountOffered),
        }
        newState.referralBonusData = referralBonusData;
      }

      this.setState(newState);
    } catch (err) {
      console.log('Error fetching current code status: ', JSON.stringify(err));
    }
  }

  onPressShareReferral = async () => {
    LoggingUtil.logEvent('USER_SHARED_REFERRAL_CODE');
    const shareMessage = friendService.sharingMessage(this.state.referralCode);
    await Share.share({ message: shareMessage });
  }

  onPressSubmitUsedCode = async () => {
    if (this.state.loading) {
      console.log('Loading')
      return false;
    }

    if (this.state.referralCodeToUse.length === 0) {
      this.setState({ codeSubmissionError: 'Please enter a referral code to use' });
      return;
    }

    this.setState({ loading: true });
    try {
      const codeToSubmit = this.state.referralCodeToUse.trim().toUpperCase();
      const params = { referralCodeUsed: codeToSubmit };
      const url = `${Endpoints.CORE}referral/use`;
      const result = await postRequest({ token: this.props.token, url, params });
      if (!result.ok) {
        throw result;
      }
      // display boost parameters etc
      const resultBody = await result.json();
      this.setState({ loading: false });
      this.handleCodeUsedResult(resultBody);      
    } catch (err) {
      // display why
      this.setState({ loading: false });
      this.handleCodeSubmissionError(err);
    }
  };

  handleCodeUsedResult(serverResult) {
    const { result } = serverResult;
    if (result === 'CODE_NOT_FOUND') {
      this.setState({ codeSubmissionError: 'Sorry, we could not find that code' });
    }
    if (result === 'USER_CANNOT_USE') {
      this.setState({ codeSubmissionError: 'Sorry, that code is not open to you at this moment' });
    }
    if (result === 'CODE_SET_NO_BOOST') {
      this.setState({ showUsedCodeModal: true, codeBoostDetails: null });
    }
    if (result === 'BOOST_CREATED') {
      const { codeBoostDetails: rawDetails } = serverResult;
      const codeBoostDetails = {
        codeOwnerName: rawDetails.codeOwnerName,
        boostAmount: safeFormatStringOrDict(rawDetails.boostAmountOffered),
        boostBalanceRequirement: safeFormatStringOrDict(rawDetails.redeemConditionAmount),
        daysToMaintain: rawDetails.daysToMaintain,
        crossByDate: moment(rawDetails.boostEndTimeMillis).format('DD ddd MMM'),
      };
      this.setState({ showUsedCodeModal: true, canUseReferralCode: false, codeBoostDetails });
    }
  }

  handleCodeSubmissionError(err) {
    console.log('Handling submission error, response: ', JSON.stringify(err));
    this.setState({ codeSubmissionError: 'Sorry, there was an error submitting the code, please try again later or contact support' });
  }

  renderOwnReferralCode() {
    const { referralCode, boostOnOffer, referralBonusData } = this.state;
    return referralCode && (
      <View style={styles.ownCodeHolder}>
        <Text style={styles.sectionHeader}>Your referral code is:</Text>
        <TouchableOpacity style={styles.referralCodeShareHolder} onPress={this.onPressShareReferral}>
          <Text style={styles.referralCodeText}>{this.state.referralCode.toUpperCase()}</Text>
          <Icon
            name="share"
            type="entypo"
            size={22}
            color={Colors.PURPLE}
          />
        </TouchableOpacity>
        {boostOnOffer && (
          <Text style={styles.referralBonusData}>
            Share your referral code with your friends, and we&apos;ll 
            {' '}<Text style={styles.boldText}>BOOST</Text> both of you!{'\n'}
            If a new user uses your code, gets their Jupiter MoneyWheel balance above 
            {' '}<Text style={styles.boldText}>{referralBonusData.boostBalanceRequirement}</Text> and keeps it there 
            for at least <Text style={styles.boldText}>{referralBonusData.daysToMaintain} days</Text>,
            then both of you will get a <Text style={[styles.boldText, styles.purpleText]}>{referralBonusData.boostAmount}</Text> boost!
          </Text>
        )}
      </View>
    )
  }

  renderUseCodeForm() {
    return this.state.canUseReferralCode && (
    <>
      <View style={styles.sectionSeparator} />
      <View style={styles.useCodeForm}>
        <Text style={styles.sectionHeader}>Use a referral code</Text>
        <Text style={styles.referralBonusData}>
          Did a friend refer Jupiter to you? Use their referral code here (caps or lower case):
        </Text>
        <Input 
          value={this.state.referralCodeToUse}
          onChangeText={text => this.setState({ referralCodeToUse: text })}
          placeholder="Enter a referral code"
          containerStyle={styles.inputWrapperStyle}
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
        />
        {this.state.codeSubmissionError.length > 0 && (
          <Text style={styles.codeSubmissionError}>{this.state.codeSubmissionError}</Text>
        )}
        <Button 
          title="SUBMIT"
          loading={this.state.loading}
          onPress={this.onPressSubmitUsedCode}
          titleStyle={styles.submitBtnTitle}
          buttonStyle={styles.submitBtnStyle}
          containerStyle={styles.submitBtnContainerStyle}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
      </View>
    </>
    );
  }

  // eslint-disable-next-line react/sort-comp
  onCloseDialog = () => this.setState({ showUsedCodeModal: false });

  renderCodeUsedModal() {
    const { codeBoostDetails } = this.state;
    return (
      <Overlay 
        isVisible={this.state.showUsedCodeModal}
        height="auto"
        width="auto"
        onBackdropPress={this.onCloseDialog}
        onHardwareBackPress={this.onCloseDialog}
      >
        <View style={styles.resultDialog}>
          <Text style={styles.resultHeader}>
            Success!
          </Text>
          {codeBoostDetails ? (
            <Text style={styles.resultBody}>
              You have used {codeBoostDetails.codeOwnerName}&apos;s referral code. Keep your balance above
              {' '}{codeBoostDetails.boostBalanceRequirement} and don&apos;t withdraw before {codeBoostDetails.noWithdrawDate},
              and both of you will get a {codeBoostDetails.boostAmount} boost!
            </Text>
          ) : (
            <Text style={styles.resultBody}>
              Thanks! We have recorded your use of the code {this.state.referralCodeUsed}. Keep being a smart saver!
            </Text>
          )}
          <Button 
            title="DONE"
            onPress={this.onCloseDialog}
            titleStyle={styles.submitBtnTitle}
            buttonStyle={styles.submitBtnStyle}
            containerStyle={styles.modalBtnContainer}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
          <TouchableOpacity style={styles.closeDialog} onPress={this.onCloseDialog}>
            <Image source={require('../../assets/close.png')} />
          </TouchableOpacity>
        </View>
      </Overlay>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderWithBack 
          headerText="Referral Code"
          onPressBack={() => this.props.navigation.goBack()}
        />
        <KeyboardAvoidingView 
          style={styles.container}
          contentContainerStyle={styles.container}
          behavior="height"
        >
          <ScrollView style={styles.scrollOuter} contentContainerStyle={styles.scrollInner}>
            {this.renderOwnReferralCode()}
            {this.state.canUseReferralCode && this.renderUseCodeForm()}
            {/* {!this.state.canUseReferralCode && this.state.hasUsedReferralCode && this.renderUsedReferralCode()} */}
          </ScrollView>
        </KeyboardAvoidingView>
        {this.state.showUsedCodeModal && this.renderCodeUsedModal()}
      </View>
    )
  }

};

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
  },
  scrollOuter: {
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  scrollInner: {
    padding: 15,
  },
  ownCodeHolder: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    fontSize: 14,
  },
  referralCodeShareHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  referralCodeText: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    fontSize: 20,
    marginRight: 10,
  },
  referralBonusData: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'poppins-regular',
    fontSize: 15,
    lineHeight: 21,
  },
  boldText: {
    fontFamily: 'poppins-semibold',
  },
  purpleText: {
    color: Colors.PURPLE,
  },
  sectionSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.GRAY,
  },
  useCodeForm: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  inputWrapperStyle: {
    marginTop: 20,
    backgroundColor: Colors.WHITE,
    minHeight: 50,
    borderRadius: 10,
    paddingVertical: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 13,
    marginLeft: 5,
  },
  submitBtnContainerStyle: {
    marginTop: 15,
    width: '100%',
  },
  submitBtnStyle: {
    borderRadius: 4,
    paddingVertical: 12,
  },
  submitBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    color: Colors.WHITE,
    fontSize: 16,
  },
  codeSubmissionError: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    marginTop: 5,
  },
  resultDialog: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  resultHeader: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    marginBottom: 5,
  },
  resultBody: {
    fontFamily: 'poppins-regular',
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
    fontSize: 15,
    lineHeight: 21,
  },
  closeDialog: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  modalBtnContainer: {
    minWidth: '100%',
    marginTop: 10,
  },
});

export default connect(mapStateToProps)(ReferralCode);
