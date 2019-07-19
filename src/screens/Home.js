import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, ImageBackground, Dimensions, Animated, Easing } from 'react-native';
import { Colors, Sizes } from '../util/Values';
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
      hasMessage: false,
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

  renderMessageCard() {
    return (
      <View style={styles.messageCard}>
        <View style={styles.messageCardHeader}>
          <Image style={styles.messageCardIcon} source={require('../../assets/notification.png')}/>
          <Text style={styles.messageCardTitle}>Watch your savings grow</Text>
        </View>
        <Text style={styles.messageCardText}>Since July 2019 you have earned <Text style={styles.messageCardBold}>R40.57</Text> in interest! Keep adding cash to your Pluto account to earn more each month for nothing.</Text>
          <View style={styles.messageCardButton}>
            <Text style={styles.messageCardButtonText}>SEE HISTORY</Text>
              <Icon
                name='chevron-right'
                type='evilicon'
                size={30}
                color={Colors.PURPLE}
              />
          </View>
      </View>
    );
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
            <View style={styles.backgroundLinesWrapper}>
              <Image style={styles.backgroundLines} source={require('../../assets/group_3.png')} resizeMode="contain"/>
            </View>
            <View style={this.state.hasMessage ? styles.headerWithMessage : styles.header}>
              {
                this.state.firstName.length > 0 ?
                <Text style={this.state.hasMessage ? styles.helloTextWithMessage : styles.helloText}>Hello, <Text style={styles.firstName}>{this.state.firstName}</Text></Text>
                : null
              }
            </View>
            <View style={styles.mainContent}>
              <View style={styles.circlesWrapper}>
                <Image style={styles.coloredCircle} source={require('../../assets/oval.png')}/>
                {/*
                  <Animated.Image style={[styles.coloredCircle, {transform: [{rotate: circleRotation}]}]} source={require('../../assets/oval.png')}/>
                */}
                <Animated.Image style={[styles.whiteCircle, {transform: [{rotate: circleRotation}]}]} source={require('../../assets/arrow_circle.png')}/>
              </View>
              <View style={styles.balanceWrapper}>
                <Text style={styles.currency}>{this.state.currency}</Text>
                <Text style={styles.balance}>{this.state.balance}</Text>
              </View>
              {/*<View style={styles.endOfMonthBalanceWrapper}>
                <Text style={styles.endOfMonthBalance}>+R{this.state.expectedToAdd}</Text>
                  <Icon
                    name='chevron-right'
                    type='evilicon'
                    size={30}
                    color={Colors.GRAY}
                  />
              </View>
              <Text style={styles.endOfMonthDesc}>Due end of month</Text>*/}
            </View>
            {
              this.state.hasMessage ?
              this.renderMessageCard()
              : null
            }
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
  backgroundLinesWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundLines: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  header: {
    marginTop: height * 0.022,
    minHeight: 50,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  headerWithMessage: {
    marginTop: height * 0.008,
    minHeight: 40,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  helloText: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'poppins-regular',
  },
  helloTextWithMessage: {
    color: 'white',
    fontSize: 24,
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
  circlesWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteCircle: {
    position: 'absolute',
    width: width,
    height: width,
  },
  coloredCircle: {
    position: 'absolute',
    width: width * 0.895,
    height: width * 0.895,
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
    marginTop: 25,
    marginLeft: 10,
    marginBottom: -10,
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
  messageCard: {
    minHeight: height * 0.23,
    width: '95%',
    backgroundColor: 'white',
    marginBottom: - (Sizes.NAVIGATION_BAR_HEIGHT - Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  messageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageCardIcon: {
    marginRight: 10,
  },
  messageCardTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.7 * FONT_UNIT,
  },
  messageCardText: {
    fontFamily: 'poppins-regular',
    fontSize: 3.2 * FONT_UNIT,
  },
  messageCardBold: {
    fontFamily: 'poppins-semibold',
  },
  messageCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageCardButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.2 * FONT_UNIT,
    color: Colors.PURPLE,
    marginRight: -5,
  },
});
