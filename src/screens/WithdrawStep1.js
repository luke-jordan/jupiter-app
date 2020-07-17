import React from 'react';
import { connect } from 'react-redux';

import {
  ActivityIndicator,
  Picker,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Input, Overlay } from 'react-native-elements';

import HeaderWithBack from '../elements/HeaderWithBack';

import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getAccountId } from '../modules/profile/profile.reducer';

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  accountId: getAccountId(state),
})

class WithdrawStep1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bank: '',
      accountNumber: '',
      accountType: '',
      loading: false,
      errors: null,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_INITIATED_WITHDRAWAL');
  }

  onPressBack = () => {
    this.props.navigation.navigate('Account'); // because we may get back here from eg support, and we want to always have a route out
  };

  verifyData = () => {
    const errors = {};
    let flag = false;
    if (this.state.bank.length < 1) {
      errors.bank = true;
      flag = true;
    }
    if (this.state.accountNumber.length < 1) {
      errors.accountNumber = true;
      flag = true;
    }
    if (this.state.accountType.length < 1) {
      errors.accountType = true;
      flag = true;
    }
    if (flag) {
      this.setState({
        errors,
        loading: false,
      });
      return false;
    }
    return true;
  };

  onPressNext = async () => {
    if (this.state.loading) return;
    if (!this.verifyData()) return;
    this.setState({ loading: true });

    try {
      const result = await fetch(`${Endpoints.CORE}withdrawal/initiate`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'POST',
        body: JSON.stringify({
          accountId: this.props.accountId,
          bankDetails: {
            bankName: this.state.bank,
            accountNumber: this.state.accountNumber,
            accountType: this.state.accountType,
          },
        }),
      });
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({ loading: false });
        this.props.navigation.navigate('WithdrawStep2', {
          accountHolder: this.state.accountHolder,
          accountNumber: this.state.accountNumber,
          bank: this.state.bank,
          initiateResponseData: resultJson,
        });
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Error on withdrawal initiate: ', error);
      this.setState({ loading: false });
      this.showError(error);
    }
  };

  onPressSupport = () => {
    const preFilledSupportMessage = 'Please withdraw from my account into a bank not listed on the withdraw screen';
    this.props.navigation.navigate('Support', { originScreen: 'WithdrawStep1', preFilledSupportMessage });
  };

  showError(error) {
    if (error) {
      this.setState({
        errors: error,
      });
    } else {
      this.setState({
        errors: {
          generalError: true,
        },
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderWithBack
          headerText="Withdraw Cash"
          onPressBack={this.onPressBack}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.topDescription}>
            We’ll transfer your cash into your bank account, only yours
          </Text>
          <Text style={styles.note}>
            <Text style={styles.bold}>Note:</Text> This account must be owned by
            you, in the same name as your Jupiter account. By law we cannot
            transfer into an account in any other name. If your bank is not
            listed, please{' '}
            <Text style={styles.textAsButton} onPress={this.onPressSupport}> contact support</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Bank</Text>
            <View style={styles.pickerWrapperStyle}>
              <Picker
                selectedValue={this.state.bank}
                style={styles.pickerStyle}
                itemStyle={styles.pickerItemStyle}
                itemTextStyle={styles.pickerItemStyle}
                onValueChange={itemValue =>
                  this.setState({ bank: itemValue, errors: null })
                }
              >
                <Picker.Item label="Choose Bank" value="" />
                <Picker.Item label="FNB" value="FNB" />
                <Picker.Item label="Capitec" value="CAPITEC" />
                <Picker.Item label="Standard Bank" value="STANDARD" />
                <Picker.Item label="Absa" value="ABSA" />
                <Picker.Item label="Nedbank" value="NEDBANK" />
                <Picker.Item label="Tyme" value="TYME" />
              </Picker>
            </View>
            {this.state.errors && this.state.errors.bank ? (
              <Text style={styles.errorMessage}>Please select a bank</Text>
            ) : null}
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Account Number</Text>
            <Text style={styles.note}>We need your bank ACCOUNT number, <Text style={styles.bold}>not</Text> bank CARD number</Text>
            <Input
              value={this.state.accountNumber}
              onChangeText={text =>
                this.setState({ accountNumber: text, errors: null })
              }
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={[
                styles.inputStyle,
                this.state.errors && this.state.errors.accountNumber
                  ? styles.redText
                  : null,
              ]}
              containerStyle={styles.containerStyle}
            />
            {this.state.errors && this.state.errors.accountNumber ? (
              <Text style={styles.errorMessage}>
                Please enter a valid account number
              </Text>
            ) : null}
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Account type</Text>
            <View style={styles.pickerWrapperStyle}>
              <Picker
                selectedValue={this.state.accountType}
                style={styles.pickerStyle}
                itemStyle={styles.pickerItemStyle}
                itemTextStyle={styles.pickerItemStyle}
                onValueChange={itemValue =>
                  this.setState({ accountType: itemValue, errors: null })
                }
              >
                <Picker.Item label="Account type" value="" />
                <Picker.Item label="Cheque / current" value="CURRENT" />
                <Picker.Item label="Savings" value="SAVINGS" />
                <Picker.Item label="Transmission" value="TRANSMISSION" />
                <Picker.Item label="Bond" value="BOND" />
              </Picker>
            </View>
            {this.state.errors && this.state.errors.accountType ? (
              <Text style={styles.errorMessage}>
                Please select an account type
              </Text>
            ) : null}
          </View>
          <Text style={styles.note}>
              We process your withdrawal as soon as you request it, but 
              it can take up to 2 days for your money to reflect in your bank account
          </Text>
        </ScrollView>
        {this.state.errors && this.state.errors.generalError ? (
          <Text style={styles.generalError}>
            There has been a problem with your request
          </Text>
        ) : null}
        <Button
          title="NEXT"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressNext}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />

        <Overlay
          isVisible={this.state.loading}
          containerStyle={styles.dialogStyle}
          height="auto"
          width="auto"
          onBackdropPress={() => {}}
          onHardwareBackPress={() => {
            return true;
          }}
        >
          <View style={styles.dialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.dialogText}>Verifying your data...</Text>
          </View>
        </Overlay>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 22,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: '100%',
    padding: 15,
  },
  topDescription: {
    marginVertical: 10,
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    fontSize: 18,
    lineHeight: 25,
  },
  note: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  inputWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  labelStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.DARK_GRAY,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
  },
  pickerItemStyle: {
    fontFamily: 'poppins-semibold',
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
  },
  pickerWrapperStyle: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
  },
  pickerStyle: {
    flex: 1,
    width: '100%',
  },
  redText: {
    color: Colors.RED,
  },
  textAsButton: {
    fontFamily: 'poppins-semibold',
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
    marginVertical: 10,
    justifyContent: 'center',
    width: '90%',
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
    marginTop: -15, // this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
    width: '100%',
  },
  generalError: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
    width: '100%',
    textAlign: 'center',
    marginTop: 20,
  },
  dialogWrapper: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingBottom: 0,
  },
  dialogText: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    marginHorizontal: 30,
    textAlign: 'center',
  },
});

export default connect(mapStateToProps)(WithdrawStep1);
