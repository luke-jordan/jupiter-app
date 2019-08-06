import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Button, Icon, Input } from 'react-native-elements';
import { Colors, Endpoints } from '../util/Values';

export default class Register extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      firstName: "test",
      lastName: "test",
      idNumber: "000000002",
      userId: "testemail2@test.tst",
      referralCode: "",
      errors: {
        firstName: false,
        lastName: false,
        idNumber: false,
        userId: false,
        general: false,
      },
    };
  }

  async componentDidMount() {
    let referralCode = this.props.navigation.getParam("referralCode");
    if (referralCode && referralCode.length > 0) {
      this.setState({referralCode});
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  fieldIsMandatory(field) {
    switch (field) {
      case "firstName":
      case "lastName":
      case "idNumber":
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

  onPressTerms = () => {
    this.props.navigation.navigate('Terms');
  }

  onPressRegister = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    //TODO validate
    try {
      let result = await fetch(Endpoints.AUTH + 'register/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "countryCode3Letter": 'ZAF',
          "nationalId": this.state.idNumber,
          "phoneOrEmail": this.state.userId, //TODO (note: not strictly necessary, but best if phone number is converted to E164 standard, e.g., 27813074085),
          "personalName": this.state.firstName,
          "familyName": this.state.lastName,
          "referralCode": this.state.referralCode,
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        console.log(resultJson);
        this.setState({loading: false});
        if (resultJson.result.includes("SUCCESS")) {
          this.props.navigation.navigate("SetPassword", {systemWideUserId: resultJson.systemWideUserId});
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
          <Text style={styles.title}>Let’s create your Jupiter account</Text>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.mainContent}>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>First Name*</Text>
                <Input
                  value={this.state.firstName}
                  onChangeText={(text) => this.onEditField(text, "firstName")}
                  onEndEditing={() => this.onEndEditing("firstName")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.firstName ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.firstName ?
                  <Text style={styles.errorMessage}>Please enter a valid first name</Text>
                  : null
                }
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Last Name*</Text>
                <Input
                  value={this.state.lastName}
                  onChangeText={(text) => this.onEditField(text, "lastName")}
                  onEndEditing={() => this.onEndEditing("lastName")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.lastName ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.lastName ?
                  <Text style={styles.errorMessage}>Please enter a valid last name</Text>
                  : null
                }
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>ID Number*</Text>
                <Input
                  value={this.state.idNumber}
                  onChangeText={(text) => this.onEditField(text, "idNumber")}
                  onEndEditing={() => this.onEndEditing("idNumber")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.idNumber ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.idNumber ?
                  <Text style={styles.errorMessage}>Please enter a valid ID number</Text>
                  : null
                }
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Email Address or Phone number</Text>
                <Input
                  value={this.state.userId}
                  onChangeText={(text) => this.onEditField(text, "userId")}
                  onEndEditing={() => this.onEndEditing("userId")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.userId ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.userId ?
                  <Text style={styles.errorMessage}>Please enter a valid email address or phone number</Text>
                  : null
                }
            </View>
          </ScrollView>
          {
            this.state.errors && this.state.errors.general ?
            <Text style={styles.errorMessage}>There is a problem with your request</Text>
            : null
          }
          <Text style={styles.disclaimer}>Continuing means you’ve read and agreed to Jupiter’s{" "}
            <Text style={styles.disclaimerButton} onPress={this.onPressTerms}>T’C & C’s.</Text>
          </Text>
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
    marginLeft: 15,
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
  disclaimer: {
    width: '100%',
    paddingHorizontal: 15,
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    fontSize: 11,
  },
  disclaimerButton: {
    textDecorationLine: 'underline',
  }
});
