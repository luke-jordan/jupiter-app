import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, ImageBackground, Dimensions, Animated, Easing } from 'react-native';
import { Colors } from '../util/Values';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import NavigationBar from '../elements/NavigationBar';
import { NavigationUtil } from '../util/NavigationUtil';

let {height, width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      currency: "R",
      balance: "2,200.40",
      expectedToAdd: "100.00",
      rotation: new Animated.Value(0),
    };
  }

  async componentDidMount() {
    let info = this.props.navigation.getParam('userInfo');
    if (!info) {
      info = await AsyncStorage.getItem('userInfo');
      if (!info) {
        NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Login');
      } else {
        info = JSON.parse(info);
      }
    }
    console.log(info);
    this.setState({
      firstName: info.profile.personalName,
    });
    this.rotateCircle();
  }

  rotateCircle() {
    Animated.timing(
      this.state.rotation,
      {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
      }
    ).start(() => {
      this.setState({
        rotation: new Animated.Value(0),
      });
      this.rotateCircle();
    });
  }

  render() {
    const circleRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    return (
      <View style={styles.container}>
        <View style={styles.gradientWrapper}>
          <LinearGradient colors={[Colors.LIGHT_BLUE, Colors.PURPLE]} style={styles.gradientContainer}>
            <ImageBackground style={styles.backgroundLines} source={require('../../assets/group_3.png')}>
              <View style={styles.header}>
                {
                  this.state.firstName.length > 0 ?
                  <Text style={styles.helloText}>Hello, <Text style={styles.firstName}>{this.state.firstName}</Text></Text>
                  : null
                }
              </View>
              <View style={styles.mainContent}>
                <Animated.Image style={[styles.whiteCircle, {transform: [{rotate: circleRotation}]}]} source={require('../../assets/arrow_circle.png')}/>
                <View style={styles.balanceWrapper}>
                  <Text style={styles.currency}>{this.state.currency}</Text>
                  <Text style={styles.balance}>{this.state.balance}</Text>
                </View>
                <View style={styles.endOfMonthBalanceWrapper}>
                  <Text style={styles.endOfMonthBalance}>+R{this.state.expectedToAdd}</Text>
                    <Icon
                      name='chevron-right'
                      type='evilicon'
                      size={30}
                      color={Colors.GRAY}
                    />
                </View>
                <Text style={styles.endOfMonthDesc}>Due end of month</Text>
              </View>
            </ImageBackground>
            <NavigationBar navigation={this.props.navigation} currentTab={0} />
          </LinearGradient>
        </View>
      </View>
    );
  }
}

// </Mutation>

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientWrapper: {
    flex: 1,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  backgroundLines: {
    flex: 1,
    width: '100%',
  },
  header: {
    marginTop: 30,
    minHeight: 50,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  helloText: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'poppins-regular',
  },
  firstName: {
    fontFamily: 'poppins-semibold',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  whiteCircle: {
    width: width,
    height: width,
    position: 'absolute',
  },
  balanceWrapper: {
    flexDirection: 'row',
  },
  balance: {
    color: 'white',
    fontSize: 13 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    lineHeight: 70,
  },
  currency: {
    color: 'white',
    fontSize: 6.5 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    textAlignVertical: 'top',
    marginRight: 2,
    lineHeight: 40,
  },
  endOfMonthBalanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  endOfMonthBalance: {
    color: 'white',
    fontSize: 7.5 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
  },
  endOfMonthDesc: {
    color: Colors.GRAY,
    fontSize: 5 * FONT_UNIT,
    fontFamily: 'poppins-regular',
  },
});
