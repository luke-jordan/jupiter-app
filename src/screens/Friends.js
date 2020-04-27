import React from 'react';
import { connect } from 'react-redux';

import {
  AsyncStorage,
  Dimensions,
  Clipboard,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import { Button } from 'react-native-elements';

import { LogoutUtil } from '../util/LogoutUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';
import { standardFormatAmount, formatStringTemplate } from '../util/AmountUtil';

import NavigationBar from '../elements/NavigationBar';

import { getComparatorRates } from '../modules/balance/balance.reducer';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const mapStateToProps = state => ({
  comparatorRates: getComparatorRates(state),
});

const BODY_TEXT_NO_AMOUNT_DEFAULT = `Invite your friends to Jupiter using your unique referral code! Just click the button below, ` +
  `choose how you want to share the message and use our message (or create your own) - and that's it!`;
const BODY_TEXT_W_AMOUNT_DEFAULT = `Invite your friends to Jupiter using the referral code below. We’ll add {boostAmount} to your balance ` +
  `each time one of them signs up and starts saving! `;


class Friends extends React.Component {
  constructor(props) {
    super(props);
    this.toastRef = React.createRef(null);
    this.state = {
      shareCode: '',
      shareLink: 'https://jupitersave.com/',
      bodyText: BODY_TEXT_NO_AMOUNT_DEFAULT,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_FRIENDS_SCREEN');
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      LogoutUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
      this.setUpReferralVariables(info.profile);
    }
  }

  async setUpReferralVariables(userProfile) {
    if (!userProfile) {
      LoggingUtil.logError(Error('Empty user profile passed to set up referral vars'));
      return;
    }

    this.setState({
      shareCode: userProfile.referralCode,
    });

    try {
      const result = await fetch(`${Endpoints.CORE}referral/verify`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          referralCode: userProfile.referralCode,
          countryCode: 'ZAF',
          includeFloatDefaults: true,
        }),
      });
      if (result.ok) {
        const { codeDetails } = await result.json();
        if (codeDetails) {
          this.setParamsFromCodeDetails(codeDetails);
        }
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Error fetching referral details: ', JSON.stringify(error));
    }
  }

  setParamsFromCodeDetails = codeDetails => {
    const { context, floatDefaults } = codeDetails;

    if (context.shareLink || floatDefaults.shareLink) {
      this.setState({ shareLink: context.shareLink || floatDefaults.shareLink });
    }
    
    let referralBoostAvailable = false;
    let referralBoostDict = {};
    if (context && typeof context.boostAmountOffered === 'string' && context.boostAmountOffered.length > 0) {
      try {
        const [boostAmount, boostUnit, boostCurrency] = context.boostAmountOffered.split('::');
        referralBoostAvailable = parseInt(boostAmount, 10) > 0;
        referralBoostDict = { amount: parseInt(boostAmount, 10), unit: boostUnit, currency: boostCurrency };
      } catch (error) {
        console.log('Server sent malformed boost amount string');
      }
    }

    if (referralBoostAvailable) {
      const bodyTextTemplate = context.bodyTextAmountTemplate || floatDefaults.bodyTextAmountTemplate || BODY_TEXT_W_AMOUNT_DEFAULT; 
      const boostAmountFormatted = standardFormatAmount(referralBoostDict.amount, referralBoostDict.unit, referralBoostDict.currency);
      const formattedText = formatStringTemplate(bodyTextTemplate, { boostAmount: boostAmountFormatted }); 
      this.setState({ bodyText: formattedText });
    } else {
      const bodyText = context.bodyTextNoAmountTemplate || floatDefaults.bodyTextNoAmountTemplate || BODY_TEXT_NO_AMOUNT_DEFAULT;
      this.setState({ bodyText });
    }
  }

  onPressShare = async () => {
    // if (this.state.loading) return;
    // this.setState({ loading: true });

    const currentRate = parseFloat(this.props.comparatorRates.referenceRate / 100).toFixed(0);

    const shareMessage = `I’d love for you to join me on the Jupiter savings app. Jupiter REWARDS us for SAVING & building our wealth, ` +
      `not for spending. We earn ${currentRate}% per year on any savings amount, and can withdraw anytime – with no fees! ` + 
      `\n\nUse my referral code ${this.state.shareCode} to sign up, by downloading at: ${this.state.shareLink}`;

    try {
      await Share.share({ message: shareMessage });
      this.setState({ loading: false });
      LoggingUtil.logEvent('USER_SHARED_REFERRAL_CODE');
    } catch (error) {
      // this.setState({ loading: false });
    }
    // this.setState({ loading: false });
  };

  onPressCopy = () => {
    Clipboard.setString(this.state.shareCode);
    this.toastRef.current.show('Copied to clipboard!');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <Image
            style={styles.image}
            source={require('../../assets/group_77.png')}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            Jupiter will be launching the ability to save with your friends soon
          </Text>
          <Text style={styles.description}>
            <Text style={styles.bold}>While you wait - </Text>
            {this.state.bodyText}
          </Text>
        </View>
        <View style={styles.input}>
          <View style={styles.shareLine}>
            <Text style={styles.shareCode}>{this.state.shareCode}</Text>
            <TouchableOpacity onPress={this.onPressCopy}>
              <Image
                style={styles.copyIcon}
                source={require('../../assets/copy.png')}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Button
            title="SHARE WITH FRIENDS"
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressShare}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
        </View>
        <NavigationBar navigation={this.props.navigation} currentTab={1} />
        <Toast ref={this.toastRef} opacity={1} style={styles.toast} />
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
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  input: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  image: {
    height: '35%',
    marginTop: 10,
    marginBottom: 35,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 5.4 * FONT_UNIT,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 2.9 * FONT_UNIT,
    marginBottom: 5,
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  shareLine: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  shareCode: {
    flex: 1,
    marginLeft: 15,
    fontFamily: 'poppins-regular',
    color: Colors.PURPLE,
    fontSize: 4.4 * FONT_UNIT,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 5 * FONT_UNIT,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: '90%',
  },
  buttonContainerStyle: {
    marginBottom: 15,
    justifyContent: 'center',
    width: '100%',
  },
  copyIcon: {
    marginRight: 15,
    width: 22,
    height: 22,
  },
});

export default connect(mapStateToProps)(Friends);
