import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';

import { Button, Icon } from 'react-native-elements';
import { Colors } from '../util/Values';
import { LoggingUtil } from '../util/LoggingUtil';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const FINAL_TAB_INDEX = 4;

export default class Onboarding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_INTRO');
  }

  onPressNext = async () => {
    if (this.state.loading) return;
    if (this.swiperRef && this.state.currentTab < FINAL_TAB_INDEX) {
      LoggingUtil.logEvent('USER_VISITED_SCREEN', {
        intro_screen_name: this.getTabTitle(this.state.currentTab + 1),
      });
      this.swiperRef.scrollBy(1, true);
    } else if (this.state.currentTab === FINAL_TAB_INDEX) {
      this.props.navigation.navigate('LimitedUsers');
    }
  };

  onIndexChanged = index => {
    this.setState({
      currentTab: index,
    });
  };

  onPressSkip = async () => {
    LoggingUtil.logEvent('USER_SKIPPED_INTRO');
    this.props.navigation.navigate('LimitedUsers');
  };

  getTabTitle = index => {
    switch (index) {
      case 0:
        return 'Grow your money faster';
      case 1:
        return 'Build your rainy day fund';
      case 2:
        return 'Add money, earn interest';
      case 3:
        return 'Watch your money grow, hour by hour';
      case 4:
        return 'You save, you win';
    }
  };

  getTabImage = index => {
    switch (index) {
      case 0:
        return require('../../assets/group_6.png');
      case 1:
        return require('../../assets/group_9.png');
      case 2:
        return require('../../assets/group_8.png');
      case 3:
        return require('../../assets/stay-in-touch.png');
      case 4:
        return require('../../assets/group_66.png');
    }
  };

  getTabText = index => {
    switch (index) {
      case 0:
        return 'Welcome to Jupiter, the savings app with a difference. We’re here to help you make the most of your money.';
      case 1:
        return 'You can instruct us to withdraw any time. Be prepared for that little unplanned expense, or, the next pandemic.';
      case 2:
        return 'Once you add money in your Jupiter account, you start earning interest immediately. From your first R1, straight up earnings.';
      case 3:
        return 'Jupiter’s MoneyWheel shows you how much your money is growing by the hour - even while you’re sleeping.';
      case 4:
        return 'Get rewarded for saving, not spending. Jupiter exists to help you build good saving habits. So, every time you save, you get rewarded for it—just like that.';
    }
  };

  renderTab(item, index) {
    return (
      <View style={styles.slide} key={index}>
        <Image
          style={styles.tabImage}
          source={this.getTabImage(index)}
          resizeMode="contain"
        />
        <Text style={styles.tabTitle}>{this.getTabTitle(index)}</Text>
        <Text style={styles.tabDescription}>{this.getTabText(index)}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.skipButton} onPress={this.onPressSkip}>
          <Text style={styles.skipButtonText}>SKIP INTRO</Text>
          <Icon
            name="chevron-right"
            type="evilicon"
            size={30}
            color={Colors.PURPLE}
          />
        </TouchableOpacity>
        <Swiper
          containerStyle={styles.wrapper}
          ref={ref => {
            this.swiperRef = ref;
          }}
          onIndexChanged={index => this.onIndexChanged(index)}
          loop={false}
          index={this.state.currentTab}
          activeDotColor={Colors.PURPLE}
          dotStyle={styles.dotStyle}
          activeDotStyle={styles.activeDotStyle}
        >
          {['Tab1', 'Tab2', 'Tab3', 'Tab4', 'Tab5'].map((item, index) =>
            this.renderTab(item, index)
          )}
        </Swiper>
        <View style={styles.nextButtonWrapper}>
          <Button
            testID="onboarding-button"
            accessibilityLabel="onboarding-button"
            title={this.state.currentTab === FINAL_TAB_INDEX ? 'START SAVING' : 'NEXT'}
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressNext}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
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
    maxHeight: '68%',
  },
  activeDotStyle: {
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    marginTop: 10,
  },
  dotStyle: {
    width: 12,
    height: 12,
    borderRadius: 12 / 2,
    marginTop: 10,
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
    width: '100%',
    textAlign: 'left',
    fontFamily: 'poppins-semibold',
    fontSize: 8 * FONT_UNIT,
    lineHeight: 10 * FONT_UNIT,
    marginBottom: 5,
  },
  tabDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    marginBottom: 10,
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
