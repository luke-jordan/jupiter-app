import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Button, Icon, Input } from 'react-native-elements';
import { Colors, Endpoints } from '../util/Values';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';

export default class SetPassword extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      generatePasswordLoading: false,
      password: "",
      passwordConfirm: "",
      errors: {
        password: false,
        passwordConfirm: false,
        general: false,
      },
      dialogVisible: false,
      generatedPassword: "",
    };
  }

  async componentDidMount() {
    let params = this.props.navigation.state.params;
    if (params) {
      this.setState({
        systemWideUserId: params.systemWideUserId,
        clientId: params.clientId,
        defaultFloatId: params.defaultFloatId,
        defaultCurrency: params.defaultCurrency,
      });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  fieldIsMandatory(field) {
    switch (field) {
      case "password":
      case "passwordConfirm":
      return true;

      default:
      return false;
    }
  }

  onEditField = (text, field) => {
    let errors = Object.assign({}, this.state.errors);
    errors[field] = false;
    errors.general = false;
    this.setState({
      [field]: text,
      errors: errors,
    });
  }

  onEndEditing = (field) => {
    let errors = Object.assign({}, this.state.errors);
    if (this.fieldIsMandatory(field) && this.state[field].length == 0) {
      errors[field] = true;
    } else {
      errors[field] = false;
    }
    errors.general = false;
    this.setState({
      errors: errors,
    });
  }

  validateInput = async () => {
    let hasErrors = false;
    let errors = Object.assign({}, this.state.errors);
    if (this.state.password.length < 8) {
      hasErrors = true;
      errors.password = true;
    }
    if (this.state.passwordConfirm.length < 8 || this.state.password != this.state.passwordConfirm) {
      hasErrors = true;
      errors.passwordConfirm = true;
    }
    if (hasErrors) {
      await this.setState({
        errors: errors,
      });
      return false;
    }
    return true;
  }

  onPressRegister = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    let validation = await this.validateInput();
    if (!validation) {
      this.showError();
      return;
    }
    try {
      let result = await fetch(Endpoints.AUTH + 'register/password', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          systemWideUserId: this.state.systemWideUserId,
          password: this.state.password,
          clientId: this.state.clientId,
          floatId: this.state.defaultFloatId,
          currency: this.state.defaultCurrency,
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        console.log(resultJson);
        this.setState({loading: false});
        if (resultJson.result.includes("SUCCESS")) {
          this.props.navigation.navigate("AddCash", {
            isOnboarding: true,
            systemWideUserId: resultJson.systemWideUserId,
            token: resultJson.token,
            accountId: resultJson.accountId[0],
          });
        } else {
          this.showError();
        }
      } else {
        // let resultJson = await result.json();
        // console.log("resultJson:", resultJson);
        let resultText = await result.text();
        console.log("resultText:", resultText);
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
      this.showError();
    }
  }

  showError() {
    let errors = Object.assign({}, this.state.errors);
    errors.general = true;
    this.setState({
      loading: false,
      errors: errors,
    });
  }

  onPressGeneratePassword = async () => {
    if (this.state.generatePasswordLoading) return;
    this.setState({
      dialogVisible: true,
      generatePassword: "",
      generatePasswordLoading: true,
    });
    try {
      let result = await fetch(Endpoints.AUTH + 'password/generate', {
        method: 'GET',
      });
      console.log(result);
      if (result.ok) {
        let resultJson = await result.json();
        let generated = resultJson.message.newPassword;
        this.setState({
          generatedPassword: generated,
          generatePasswordLoading: false,
        });
      } else {
        throw result;
      }
    } catch (error) {
      console.log("error!", error.status);
      this.setState({generatePasswordLoading: false});
    }
  }

  onPressUseThisPassword = () => {
    this.setState({
      password: this.state.generatedPassword,
      passwordConfirm: this.state.generatedPassword,
      dialogVisible: false,
    });
  }

  onHideDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} contentContainerStyle={styles.container} behavior="padding">
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Set a password</Text>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.mainContent}>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Your Password*</Text>
                <Input
                  value={this.state.password}
                  secureTextEntry={true}
                  onChangeText={(text) => this.onEditField(text, "password")}
                  onEndEditing={() => this.onEndEditing("password")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.password ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.password ?
                  <Text style={styles.errorMessage}>Please enter a valid password</Text>
                  : null
                }
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Retype Password*</Text>
                <Input
                  value={this.state.passwordConfirm}
                  secureTextEntry={true}
                  onChangeText={(text) => this.onEditField(text, "passwordConfirm")}
                  onEndEditing={() => this.onEndEditing("passwordConfirm")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.passwordConfirm ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.passwordConfirm ?
                  <Text style={styles.errorMessage}>Passwords don't match</Text>
                  : null
                }
            </View>
          </ScrollView>
          {
            this.state.errors && this.state.errors.general ?
            <Text style={styles.errorMessage}>There is a problem with your request</Text>
            : null
          }
          <Text style={styles.generatePassword} onPress={this.onPressGeneratePassword}>Help me generate a password</Text>
          <Button
            title="CONTINUE"
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressRegister}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }} />
        </View>

        <Dialog
          visible={this.state.dialogVisible}
          dialogStyle={styles.dialogStyle}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <DialogContent style={styles.dialogWrapper}>
            <View style={styles.dialogContent}>
              <Text style={styles.dialogTitle}>Suggested password</Text>
              <View style={styles.profileField}>
                <Text style={styles.profileFieldTitle}>Password</Text>
                <Text style={[styles.containerStyle, styles.generatedPasswordStyle]}>{this.state.generatedPassword}</Text>
                <Button
                  title="USE THIS PASSWORD"
                  loading={this.state.generatePasswordLoading}
                  titleStyle={styles.buttonTitleStyle}
                  buttonStyle={styles.buttonStyle}
                  containerStyle={styles.buttonContainerStyle}
                  onPress={this.onPressUseThisPassword}
                  linearGradientProps={{
                    colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                    start: { x: 0, y: 0.5 },
                    end: { x: 1, y: 0.5 },
                  }} />
              </View>
            </View>
            <TouchableOpacity style={styles.closeDialog} onPress={this.onHideDialog} >
              <Image source={require('../../assets/close.png')}/>
            </TouchableOpacity>
          </DialogContent>
        </Dialog>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    width: '100%',
    paddingLeft: 15,
  },
  mainContent: {
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  scrollView: {
    flex: 1,
    width: '100%',
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: 'white',
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    marginVertical: 10,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  profileField: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileFieldTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
    marginBottom: 5,
  },
  profileFieldValue: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 18,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
    marginTop: -15, //this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
  },
  redText: {
    color: Colors.RED,
  },
  generatePassword: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    fontSize: 13,
    marginBottom: 10,
  },
  dialogStyle: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogWrapper: {
    minHeight: 310,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
  },
  dialogTitle: {
    textAlign: 'center',
    fontFamily: 'poppins-semibold',
    fontSize: 19,
  },
  closeDialog: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  dialogContent: {
    flex: 1,
    width: '100%',
  },
  generatedPasswordStyle: {
    fontFamily: 'poppins-regular',
    paddingLeft: 10,
    textAlignVertical: 'center',
  },
});
