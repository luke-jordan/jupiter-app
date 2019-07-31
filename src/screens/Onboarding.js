import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Dimensions } from 'react-native';
// import { reloadIfUpdateAvailable } from '../util/ExpoPublishUtil';
import { Button, Icon } from 'react-native-elements';
import { Colors } from '../util/Values';
import { NavigationUtil } from '../util/NavigationUtil';
import Swiper from 'react-native-swiper';

let {height, width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class Onboarding extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
    };
  }

  async componentDidMount() {

  }

  onPressNext = async () => {
    if (this.swiperRef && this.state.currentTab < 3) {
      this.swiperRef.scrollBy(1, true);
    } else if (this.state.currentTab == 3) {
      this.props.navigation.navigate('LimitedUsers');
    }
  }

  onIndexChanged = (index) => {
    this.setState({
      currentTab: index,
    });
  }

  onPressSkip = async () => {
    this.props.navigation.navigate('LimitedUsers');
  }

  getTabTitle = (index) => {
    switch (index) {
      case 0:
      return "A savings account with a difference";

      case 1:
      return "Add cash and earn interest immediately";

      case 2:
      return "Withdraw your funds when you need them";

      case 3:
      return "We reward you for saving not spending";
    }
  }

  getTabImage = (index) => {
    switch (index) {
      case 0:
      return require('../../assets/group_6.png');

      case 1:
      return require('../../assets/group_9.png');

      case 2:
      return require('../../assets/group_8.png');

      case 3:
      return require('../../assets/group_66.png');
    }
  }

  renderTab(item, index) {
    return (
      <View style={styles.slide} key={index}>
        <Image style={styles.tabImage} source={this.getTabImage(index)} resizeMode="contain"/>
        <Text style={styles.tabTitle}>{this.getTabTitle(index)}</Text>
        <Text style={styles.tabDescription}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin consequat placerat varius. Sed convallis velit ac dolor finibus egestas eget.</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.skipButton} onPress={this.onPressSkip}>
          <Text style={styles.skipButtonText}>SKIP INTRO</Text>
          <Icon
            name='chevron-right'
            type='evilicon'
            size={30}
            color={Colors.PURPLE}
          />
        </TouchableOpacity>
        <Swiper style={styles.wrapper}
          ref={(ref) => {this.swiperRef = ref;}}
          onIndexChanged={(index) => this.onIndexChanged(index)}
          loop={false} index={this.state.currentTab}
          activeDotColor={Colors.PURPLE}
          dotStyle={styles.dotStyle} activeDotStyle={styles.activeDotStyle}>
          {["Tab1", "Tab2", "Tab3", "Tab4"].map((item, index) => this.renderTab(item, index))}
        </Swiper>
        <View style={styles.nextButtonWrapper}>
          <Button
            title={this.state.currentTab == 3 ? "START SAVING" : "NEXT"}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    width: '100%',
  },
  activeDotStyle: {
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
  },
  dotStyle: {
    width: 12,
    height: 12,
    borderRadius: 12 / 2,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  tabImage: {
    height: '40%',
    marginBottom: 30,
  },
  tabTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 8 * FONT_UNIT,
    lineHeight: 10 * FONT_UNIT,
    marginBottom: 5,
  },
  tabDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
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
    flex: 1,
    marginVertical: 10,
    justifyContent: 'center',
    width: '80%',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    marginLeft: 5,
  },
  skipButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 4.8 * FONT_UNIT,
    color: Colors.PURPLE,
    marginRight: -5,
  },
  nextButtonWrapper: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
});
