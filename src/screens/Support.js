import React from 'react';

import { AsyncStorage, StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, TouchableOpacity, Keyboard, KeyboardAvoidingView } from 'react-native';
import { Button, Input, Icon } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { ValidationUtil } from '../util/ValidationUtil';

import { Endpoints, Colors } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class Support extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userContact: '',
      requestBody: '',
      loading: false,
    };
  }

  async componentDidMount() {
    const originScreen = this.props.navigation.getParam('originScreen');
    LoggingUtil.logEvent('USER_ENTERED_SUPPORT', { originScreen });
    
    const postSubmitNavigateHome = this.props.navigation.getParam('postSubmitNavigateHome');
    const screenToNavigatePostSubmit = postSubmitNavigateHome ? 'Home' : originScreen;
    
    const requestBody = this.props.navigation.getParam('preFilledSupportMessage') || '';
    this.setState({ screenToNavigatePostSubmit, requestBody });

    const info = await AsyncStorage.getItem('userInfo');
    const userInfo = typeof info === 'string' && info.length > 0 ? JSON.parse(info) : null;
    if (userInfo) {
      const userContactMethod = userInfo.profile.emailAddress || userInfo.profile.phoneNumber || '';
      this.setState({
        userContact: userContactMethod,
      });
    }

  }

  onFinishContactEdit() {
    this.setState({
      hasContactError: !ValidationUtil.isValidEmailPhone(this.state.userContact.trim()),
    });
  }

  onPressSend = async () => {
    if (this.state.loading) return;
    
    if (!ValidationUtil.isValidEmailPhone(this.state.userContact.trim())) {
      this.showContactError();
      return;
    }
    
    this.setState({ loading: true });
    try {
      const result = await fetch(`${Endpoints.AUTH}ineedhelp`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          contactMethod: this.state.userContact.trim(),
          messageDetails: this.state.requestBody,
        }),
      });
      if (result.ok) {
        this.setState({ loading: false });
        const resultJson = await result.json();
        if (resultJson.result.includes('SENT')) {
          this.props.navigation.navigate('SupportRequestSent', { screenToNavigatePostSubmit: this.state.screenToNavigatePostSubmit });
        } else {
          this.navigateToErrorScreen();
        }
      } else {
        throw result;
      }
    } catch (error) {
      this.navigateToErrorScreen();
    }
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  showContactError() {
    this.setState({
      loading: false,
      hasContactError: true,
    });
  };

  navigateToErrorScreen() {
    this.setState({
      loading: false,
    });
    const navigationParams = { showError: true, screenToNavigatePostSubmit: this.state.screenToNavigatePostSubmit };
    this.props.navigation.navigate('SupportRequestSent', navigationParams);
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} contentContainerStyle={styles.container} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.wrapper}>
            <View style={styles.header}>
              <View style={styles.headerTitleWrapper}>
                <TouchableOpacity style={styles.headerBackIcon} onPress={this.onPressBack}>
                  <Icon name="chevron-left" type="evilicon" size={45} color={Colors.MEDIUM_GRAY} />
                </TouchableOpacity>
                <Text style={styles.headerTitleText}>Support</Text>
              </View>
              <Text style={styles.headerSubTitle}>
                Please describe your problem with as many details as possible. We
                will get back to you as soon as we can.
              </Text>
            </View>
            <View style={styles.mainContent}>
              <View style={styles.inputWrapper}>
                <Text style={styles.labelStyle}>Your contact (phone or email)</Text>
                <Input
                  value={this.state.userContact}
                  onChangeText={text => this.setState({ userContact: text })}
                  onEndEditing={() => this.onFinishContactEdit()}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={styles.inputStyle}
                  containerStyle={styles.containerStyle}
                />
                {this.state.hasContactError ? (
                  <Text style={styles.errorMessage}>
                    We&apos;re sorry, that doesn&apos;t look like a valid phone or email, and we need 
                    one to contact you about your issue.
                  </Text>
              ) : null}
              </View>
              <View style={styles.bodyInputWrapper}>
                <Text style={styles.labelStyle}>Please describe your problem</Text>
                <Input
                  value={this.state.requestBody}
                  onChangeText={text => this.setState({ requestBody: text })}
                  multiline
                  numberOfLines={8}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, styles.inputStyleBody]}
                  containerStyle={styles.containerStyle}
                  textAlignVertical="top"
                />
              </View>
            </View>
            <Button
              title="SEND"
              loading={this.state.loading}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.onPressSend}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  header: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  headerTitleWrapper: {
    flexDirection: 'row',
    paddingVertical: 5,
    justifyContent: 'flex-start',
  },
  headerBackIcon: {
    paddingRight: 5,
    paddingLeft: 2,
  },
  headerTitleText: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.5 * FONT_UNIT,
    color: Colors.DARK_GRAY,
  },
  headerSubTitle: {
    fontFamily: 'poppins-regular',
    fontSize: 3.4 * FONT_UNIT,
    // marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    marginBottom: 15,
    justifyContent: 'center',
    width: '90%',
  },
  mainContent: {
    width: '90%',
    alignItems: 'center',
    paddingVertical: 10,
    flexGrow: 1,
  },
  labelStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-regular',
  },
  inputStyleBody: {
    textAlignVertical: 'top',
    marginTop: 5,
    minHeight: 150,
    flexGrow: 1,
    flex: 1,
  },
  bodyInputWrapper: {
    marginTop: 20,
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    backgroundColor: Colors.WHITE,
    // marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 12,
    marginBottom: 20,
  },
});
