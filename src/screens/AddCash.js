import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../util/Values';
import { Icon, Input, Button } from 'react-native-elements';

export default class AddCash extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currency: "R",
      balance: "2,200.40",
      amountToAdd: 0,
    };
  }

  async componentDidMount() {

  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressAddCash = () => {

  }

  onChangeAmount = (text) => {
    this.setState({amountToAdd: text});
  }

  onChangeAmountEnd = () => {
    this.setState({amountToAdd: parseFloat(this.state.amountToAdd).toFixed(2)});
    this.amountInputRef.blur();
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
          <Text style={styles.headerTitle}>Add cash</Text>
        </View>
        <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentContainer} >
          <View style={styles.currentBalance}>
            <Text style={styles.balanceAmount}>{this.state.currency}{this.state.balance}</Text>
            <Text style={styles.balanceDesc}>Current Balance</Text>
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.inputWrapperLeft}>
              <Text style={styles.currencyLabel}>{this.state.currency}</Text>
            </View>
            <Input
              keyboardType='numeric'
              ref={(ref) => {this.amountInputRef = ref;}}
              value={this.state.amountToAdd}
              onChangeText={(text) => this.onChangeAmount(text)}
              onEndEditing={() => this.onChangeAmountEnd()}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
          </View>
          <Text style={styles.makeSureDisclaimer}>Please make sure you have added the correct amount as this transaction cannot be reversed.</Text>
        </ScrollView>
        <Button
          title="ADD CASH"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressAddCash}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }} />
      </View>
    );
  }
}

// </Mutation>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
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
    marginVertical: 15,
    justifyContent: 'center',
    width: '80%',
  },
  mainContent: {
    width: '100%',
  },
  mainContentContainer: {
    alignItems: 'center',
  },
  currentBalance: {
    marginTop: 20,
    alignItems: 'center',
  },
  balanceAmount: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 22,
  },
  balanceDesc: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 13,
    marginTop: -4,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '90%',
    height: 70,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.PURPLE,
    borderRadius: 20,
    marginTop: 20,
  },
  inputWrapperLeft: {
    width: '13%',
    marginVertical: -1,
    marginLeft: -1,
    backgroundColor: Colors.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  currencyLabel: {
    fontFamily: 'poppins-regular',
    color: 'white',
    fontSize: 24,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    marginLeft: 12,
    fontFamily: 'poppins-regular',
    fontSize: 35,
  },
  containerStyle: {
    width: '86%',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  makeSureDisclaimer: {
    fontFamily: 'poppins-regular',
    fontSize: 11.5,
    width: '90%',
    marginTop: 10,
    lineHeight: 17,
    color: Colors.MEDIUM_GRAY,
  },
});
