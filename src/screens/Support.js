import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';

const { width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;



export default class Support extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userContact: "",
      requestBody: "",
      loading: false,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_SUPPORT');
  }

  onPressSend = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    try {
      let result = await fetch(Endpoints.AUTH + 'support', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "userContact": this.state.userContact,
          "supportRequestBody": this.state.requestBody,
        }),
      });
      if (result.ok) {
        this.setState({loading: false});
        let resultJson = await result.json();
        console.log(resultJson);
        if (resultJson.result.includes("SUCCESS")) {
          //TODO show success, block fields, show go back button - maybe in a dialog, maybe separate screen?
        } else {
          this.showError();
        }
      } else {
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
      this.showError();
    }
  }

  showError() {
    this.setState({
      loading: false,
      hasError: true,
    });
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Support</Text>
          <Text style={styles.headerText}>Please describe your problem with as many details as possible. We will make sure to get back to you as soon as we can.</Text>
        </View>
        <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Your contact (phone or email)</Text>
            <Input
              value={this.state.userContact}
              onChangeText={(text) => this.setState({userContact: text})}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Where are you stuck?</Text>
            <Input
              value={this.state.requestBody}
              onChangeText={(text) => this.setState({requestBody: text})}
              multiline={true}
              numberOfLines={10}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={[styles.inputStyle, styles.inputStyleTop]}
              containerStyle={styles.containerStyle}
            />
          </View>
        </ScrollView>
        {
          this.state.hasError ?
          <Text style={styles.errorMessage}>Some of your input might be invalid.</Text>
          : null
        }
        <Text style={styles.goback} onPress={this.onPressBack}>Go back</Text>
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
          }} />
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
    backgroundColor: Colors.WHITE,
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 10
  },
  headerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.4 * FONT_UNIT,
    marginBottom: 5,
    color: Colors.DARK_GRAY,
  },
  headerText: {
    fontFamily: 'poppins-regular',
    fontSize: 3.4 * FONT_UNIT,
    marginBottom: 5,
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
    marginVertical: 15,
    justifyContent: 'center',
    width: '90%',
  },
  mainContent: {
    width: '90%',
  },
  mainContentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
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
    fontFamily: 'poppins-semibold',
  },
  inputStyleTop: {
    textAlignVertical: 'top',
    marginTop: 5,
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    backgroundColor: Colors.WHITE,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redText: {
    color: Colors.RED,
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 12,
    marginTop: -15, //this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
  },
  goback: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
  },
});
