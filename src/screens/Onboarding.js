import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Dimensions } from 'react-native';
// import { reloadIfUpdateAvailable } from '../util/ExpoPublishUtil';
import { Button, Icon } from 'react-native-elements';
import { Colors } from '../util/Values';
import { LoggingUtil } from '../util/LoggingUtil';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class Onboarding extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent("USER_VISITED_SCREEN", {"intro_screen_name": this.getTabTitle(0)});
  }

  onPressNext = async () => {
    if (this.state.loading) return;
    if (this.swiperRef && this.state.currentTab < 3) {
      LoggingUtil.logEvent("USER_VISITED_SCREEN", {"intro_screen_name": this.getTabTitle(this.state.currentTab + 1)});
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
    LoggingUtil.logEvent("USER_SKIPPED_INTRO");
    this.props.navigation.navigate('LimitedUsers');
  }

  getTabTitle = (index) => {
    switch (index) {
      case 0:
      return "A new way to grow";

      case 1:
      return "Add money, earn interest";

      case 2:
      return "Your cash stays your cash";

      case 3:
      return "You save, you win";
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

  getTabText = (index) => {
    switch (index) {
      case 0:
      return 'Welcome to Jupiter, the savings account with a difference. We’re here to help you make the most of your money, by letting you build healthy saving habits and be rewarded along the way.';

      case 1:
      return 'Yep, it’s that easy. Once you add money in your Jupiter account, you start earning interest immediately. From your very first R1, straight up earnings.';

      case 2:
      return 'You always have access to your money, so you can withdraw funds at any time. Perfect for that little (or huge) unplanned expense.';

      case 3:
      return 'Get rewarded for saving, not spending. Jupiter exists to help you build good saving habits. So, every time you save, you get rewarded for it—just like that.';
    }
  }

  renderTab(item, index) {
    return (
      <View style={styles.slide} key={index}>
        <Image style={styles.tabImage} source={this.getTabImage(index)} resizeMode="contain"/>
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
            name='chevron-right'
            type='evilicon'
            size={30}
            color={Colors.PURPLE}
          />
        </TouchableOpacity>
        <Swiper containerStyle={styles.wrapper}
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
