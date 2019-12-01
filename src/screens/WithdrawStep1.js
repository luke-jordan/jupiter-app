import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { Image, Text, AsyncStorage, TouchableOpacity, Picker, ActivityIndicator, ScrollView } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';

export default class Withdraw extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      accountHolder: "",
      bank: "",
      accountNumber: "",
      loading: false,
      errors: null,
    };
  }

  async componentDidMount() {

    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
      this.setState({
        // balance: info.balance.currentBalance.amount,
        // unit: info.balance.currentBalance.unit,
        token: info.token,
        accountId: info.balance.accountId[0],
      });
    }

    // LoggingUtil.logEvent('USER_ENTERED_....');
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  verifyData = () => {
    let errors = {};
    let flag = false;
    if (this.state.accountHolder.length < 1) {
      errors.accountHolder = true;
      flag = true;
    }
    if (this.state.bank.length < 1) {
      errors.bank = true;
      flag = true;
    }
    if (this.state.accountNumber.length < 1) {
      errors.accountNumber = true;
      flag = true;
    }
    if (flag) {
      this.setState({
        errors: errors,
        loading: false,
      });
      return false;
    }
    return true;
  }

  onPressNext = async () => {
    if (this.state.loading) return;
    if (!this.verifyData()) return;
    this.setState({loading: true});

    try {
      let result = await fetch(Endpoints.CORE + 'withdrawal/initiate', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.state.token,
        },
        method: 'POST',
        body: JSON.stringify({
          "accountId": this.state.accountId,
          "bankDetails": {
            "accountHolder": this.state.accountHolder,
            "bankName":  this.state.bank,
            "accountNumber": this.state.accountNumber,
          }
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        this.setState({loading: false});
        this.props.navigation.navigate('WithdrawStep2', {
          accountHolder: this.state.accountHolder,
          accountNumber: this.state.accountNumber,
          bank: this.state.bank,
          initiateResponseData: resultJson,
        });
      } else {
        let resultText = await result.text();
        console.log("resultText:", resultText);
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
      this.setState({loading: false});
      this.showError(error);
    }
  }

  showError(error) {
    if (error) {

    } else {
      this.setState({
        errors: {
          generalError: true,
        }
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Cash</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.topDescription}>We’ll transfer your cash into this bank account whenever you withdraw from your Jupiter savings.</Text>
          <Text style={styles.note}><Text style={styles.bold}>Please note:</Text> This bank account needs to be owned and in the same name as your Jupiter account. By regulation we cannot transfer into an account in any other name.</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Account Holder</Text>
            <Input
              value={this.state.accountHolder}
              onChangeText={(text) => this.setState({accountHolder: text, errors: null})}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.accountHolder ? styles.redText : null]}
              containerStyle={styles.containerStyle}
            />
            {
              this.state.errors && this.state.errors.accountHolder ?
              <Text style={styles.errorMessage}>Please enter a valid account holder</Text>
              : null
            }
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Bank</Text>
            <View style={styles.pickerWrapperStyle}>
              <Picker
                selectedValue={this.state.bank}
                style={styles.pickerStyle}
                itemStyle={styles.pickerItemStyle}
                itemTextStyle={styles.pickerItemStyle}
                onValueChange={(itemValue, itemIndex) => this.setState({ bank: itemValue, errors: null })}>
                <Picker.Item label="Choose Bank" value="" />
                <Picker.Item label="FNB" value="FNB" />
                <Picker.Item label="Capitec" value="CAPITEC" />
                <Picker.Item label="Standard Bank" value="STANDARD" />
                <Picker.Item label="Absa" value="ABSA" />
                <Picker.Item label="Nedbank" value="NEDBANK" />
                <Picker.Item label="Investec" value="INVESTEC" />
              </Picker>
            </View>
            {
              this.state.errors && this.state.errors.bank ?
              <Text style={styles.errorMessage}>Please select a bank</Text>
              : null
            }
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Account Number</Text>
            <Input
              value={this.state.accountNumber}
              onChangeText={(text) => this.setState({accountNumber: text, errors: null})}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.accountNumber ? styles.redText : null]}
              containerStyle={styles.containerStyle}
            />
            {
              this.state.errors && this.state.errors.accountNumber ?
              <Text style={styles.errorMessage}>Please enter a valid account number</Text>
              : null
            }
          </View>
        </ScrollView>
        {
          this.state.errors && this.state.errors.generalError ?
          <Text style={styles.generalError}>There has been a problem with your request</Text>
          : null
        }
        <Button
          title={"NEXT"}
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressNext}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }} />

          <Dialog
            visible={this.state.loading}
            dialogStyle={styles.dialogStyle}
            dialogAnimation={new SlideAnimation({
              slideFrom: 'bottom',
            })}
            onTouchOutside={() => {}}
            onHardwareBackPress={() => {return true;}}
          >
            <DialogContent style={styles.dialogWrapper}>
              <ActivityIndicator size="large" color={Colors.PURPLE} />
              <Text style={styles.dialogText}>Verifying your data...</Text>
            </DialogContent>
          </Dialog>
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
    marginTop: 20,
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
    backgroundColor: 'white',
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
    backgroundColor: 'white',
  },
  pickerStyle: {
    flex: 1,
    width: '100%',
  },
  redText: {
    color: Colors.RED,
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
    marginTop: -15, //this is valid because of the exact alignment of other elements - do not reuse in other components
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
