import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import { Overlay, Button, Input } from 'react-native-elements';

import HeaderWithBack from '../elements/HeaderWithBack';

import { Colors, Endpoints } from '../util/Values';

import { LoggingUtil } from '../util/LoggingUtil';
import { friendService } from '../modules/friend/friend.service';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getRequest, postRequest } from '../modules/auth/auth.helper';

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
  }

  onLoadFetchCodeStatus = async () => {
    try {
      const url = `${Endpoints.CORE}referral/status`;
      const referralResponse = await getRequest({ token: this.props.token, url });
      if (!referralResponse.ok) {
        throw referralResponse;
      }

      const referralData = await referralResponse.json();
      
      const { canUseReferralCode, hasUsedReferralCode, referralBonusData } = referralData;

      const newState = { canUseReferralCode, hasUsedReferralCode, referralBonusData };
      if (hasUsedReferralCode) {
        newState.referralCodeUsed = this.props.referralCodeUsed;
      }

      if (!this.state.referralCode) {
        newState.referralCode = referralData.userReferralCode;
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
      if (result.ok) {
        // display boost parameters etc
        this.setState({ loading: false });
      }
    } catch (err) {
      // display why
      this.setState({ loading: false });
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
      this.setState({ showUsedCodeModal: true, codeBonusDetails: null });
    }
    if (result === 'BOOST_TRIGGERED') {
      this.setState({ showUsedCodeModal: true, codeBonusDetails: result.codeBonusDetails });
    }
  }

  renderOwnReferralCode() {
    const { referralCode, referralBonusData } = this.state;
    return referralCode && (
      <View style={styles.ownCodeHolder}>
        <Text style={styles.sectionHeader}>Your referral code is:</Text>
        <TouchableOpacity style={styles.referralCodeShareHolder} onPress={this.onPressShareReferral}>
          <Text style={styles.referralCodeText}>{this.state.referralCode.toUpperCase()}</Text>
          <Image
            style={styles.copyIcon}
            source={require('../../assets/copy.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {referralBonusData && (
          <Text style={styles.referralBonusData}>
            Share your referral code with your friends, and we&amp;ll BOOST both of you!{'\n'}
            If a new user uses your code, gets their Jupiter MoneyWheel balance above 
            R{referralBonusData.redeemConditionAmount} and keeps it there for at least {referralBonusData.daysToMaintain} days,
            then both of you will get a R{referralBonusData.boostAmountOffered} boost!
          </Text>
        )}
      </View>
    )
  }

  // renderUsedReferralCode() {
  // }

  renderUseCodeForm() {
    return this.state.canSubmitReferral && (
      <View style={styles.useCodeForm}>
        <Text style={styles.sectionHeader}>Use a referral code</Text>
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
    );
  }

  renderCodeUsedModal() {
    const { codeBonusDetails } = this.state;
    return (
      <Overlay 
        isVisible={this.state.showUsedCodeModal}
        height="auto"
        width="auto"
        onBackdropPress={() => this.setState({ showUsedCodeModal: false })}
        onHardwareBackPress={() => this.setState({ showUsedCodeModal: false })}
      >
        <View style={styles.resultDialog}>
          <Text style={styles.resultHeader}>
            Success!
          </Text>
          {codeBonusDetails ? (
            <Text style={styles.resultBody}>
              You have used {codeBonusDetails.codeOwnerName}&apos;s referral code. Keep your balance above
              {codeBonusDetails.boostBalanceRequirement} and don&apost;t withdraw before {codeBonusDetails.noWithdrawDate},
              and both of you will get a R{codeBonusDetails.boostAmount} boost!
            </Text>
          ) : (
            <Text style={styles.resultBody}>
              Thanks! We have recorded your use of the code {this.state.referralCodeUsed}. Keep being a smart saver!
            </Text>
          )}
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
        <ScrollView style={styles.scrollOuter} contentContainerStyle={styles.scrollInner}>
          {this.renderOwnReferralCode()}
          {/* {this.state.canUseReferralCode && this.renderUseCodeForm()} */}
          {!this.state.canUseReferralCode && this.state.hasUsedReferralCode && this.renderUsedReferralCode()}
        </ScrollView>
        {this.state.showUsedCodeModal && this.renderCodeUsedModal()}
      </View>
    )
  }

};

const styles = StyleSheet.create({ 

});

export default connect(mapStateToProps)(ReferralCode);
