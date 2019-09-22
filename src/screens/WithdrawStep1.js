import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { Image, Text, AsyncStorage, TouchableOpacity } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';


export default class Withdraw extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    // LoggingUtil.logEvent('USER_ENTERED_....');
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressNext = () => {
    this.props.navigation.navigate('WithdrawStep2');
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
        <View style={styles.content}>
          <Text style={styles.topDescription}>We’ll transfer your cash into this bank account whenever you withdraw from your Jupiter savings.</Text>
          <Text style={styles.note}><Text style={styles.bold}>Please note:</Text> This bank account needs to be owned and in the same name as your Jupiter account. By regulation we cannot transfer into an account in any other name.</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Account Holder</Text>
            <Input
              value={this.state.accountHolder}
              onChangeText={(text) => this.setState({accountHolder: text, hasError: false})}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={[styles.inputStyle, this.state.hasError ? styles.redText : null]}
              containerStyle={styles.containerStyle}
            />
            {
              this.state.hasError ?
              <Text style={styles.errorMessage}>Please enter a valid account holder</Text>
              : null
            }
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Bank</Text>
            <Input
              value={this.state.bank}
              onChangeText={(text) => this.setState({bank: text, hasError: false})}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={[styles.inputStyle, this.state.hasError ? styles.redText : null]}
              containerStyle={styles.containerStyle}
            />
            {
              this.state.hasError ?
              <Text style={styles.errorMessage}>Please enter a valid bank</Text>
              : null
            }
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelStyle}>Account Number</Text>
            <Input
              value={this.state.accountNumber}
              onChangeText={(text) => this.setState({accountNumber: text, hasError: false})}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={[styles.inputStyle, this.state.hasError ? styles.redText : null]}
              containerStyle={styles.containerStyle}
            />
            {
              this.state.hasError ?
              <Text style={styles.errorMessage}>Please enter a valid account number</Text>
              : null
            }
          </View>
        </View>
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
  content: {
    flex: 1,
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
});
