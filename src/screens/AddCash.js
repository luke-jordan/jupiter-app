import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Endpoints } from '../util/Values';
import { Icon, Input, Button } from 'react-native-elements';

export default class AddCash extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currency: "R",
      balance: "2,200.40",
      amountToAdd: 0,
      isOnboarding: false,
      loading: false,
    };
  }

  async componentDidMount() {
    let params = this.props.navigation.state.params;
    if (params) {
      this.setState({
        isOnboarding: params.isOnboarding,
        systemWideUserId: params.systemWideUserId,
        token: params.token,
        accountId: params.accountId,
      });
      console.log(params);
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressAddCash = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});

    let token = null, accountId = null;
    if (this.state.isOnboarding) {
      token = this.props.navigation.state.params.token;
      accountId = this.props.navigation.state.params.accountId;
    } else {
      //TODO set token and accountId from profile info
      this.setState({loading: false});
      return;
    }
    try {
      let result = await fetch(Endpoints.CORE + 'addcash/initiate', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        method: 'POST',
        body: JSON.stringify({
          "accountId": accountId,
          "savedAmount": this.state.amountToAdd * 10000, //multiplying by 100 to get cents and again by 100 to get hundreth cent
          "savedCurrency": "ZAR", //TODO implement for handling other currencies
          "savedUnit": "HUNDREDTH_CENT"
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        console.log(resultJson);
        this.setState({loading: false});
        // if (resultJson.result.includes("SUCCESS")) {
        //   this.props.navigation.navigate("AddCash", {
        //     isOnboarding: true,
        //     systemWideUserId: resultJson.systemWideUserId,
        //     token: resultJson.token,
        //     accountId: resultJson.accountId[0],
        //   });
        // } else {
        //   this.showError();
        // }
      } else {
        let resultText = await result.text();
        console.log("resultText:", resultText);
        // throw result;
      }
      this.props.navigation.navigate('Payment');
    } catch (error) {
      console.log("error!", error);
      this.setState({loading: false});
      // this.showError();
    }
  }

  onChangeAmount = (text) => {
    this.setState({amountToAdd: text});
  }

  onChangeAmountEnd = () => {
    this.setState({amountToAdd: parseFloat(this.state.amountToAdd).toFixed(2)});
    this.amountInputRef.blur();
  }

  renderHeader() {
    if (this.state.isOnboarding) {
      return (
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
              <Icon
                name='chevron-left'
                type='evilicon'
                size={45}
                color={Colors.GRAY}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitleOnboarding}>Add some cash</Text>
        </View>
      );
    } else {
      return (
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
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentContainer} >
          {
            this.state.isOnboarding ?
            <Text style={styles.onboardingTitle}>Choose an amount</Text>
            :
            <View style={styles.currentBalance}>
              <Text style={styles.balanceAmount}>{this.state.currency}{this.state.balance}</Text>
              <Text style={styles.balanceDesc}>Current Balance</Text>
            </View>
          }
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
          title="NEXT: PAYMENT"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  headerWrapper: {
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: 5,
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
  headerTitleOnboarding: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    width: '100%',
    paddingLeft: 15,
  },
  onboardingTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    textAlign: 'left',
    width: '90%',
    marginTop: 25,
    marginBottom: -10,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
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
