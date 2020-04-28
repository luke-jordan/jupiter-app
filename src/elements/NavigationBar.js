import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import { getHasBoostsAvailable } from '../modules/boost/boost.reducer';
import { getOnboardStepsRemaining } from '../modules/profile/profile.reducer';

import { Colors, Sizes } from '../util/Values';

const NOTIFICATION_DOT_SIZE = 9;

const bgColor = '#00000000';

class NavigationBar extends React.Component {
  onPressAddCash = () => {
    const { onboardStepsRemaining } = this.props;
    
    // for new onboard experiment
    if (Array.isArray(onboardStepsRemaining) && onboardStepsRemaining.includes('ADD_CASH')) {
      this.props.navigation.navigate('OnboardAddSaving', { startNewTransaction: true });
      return;
    }

    this.props.navigation.navigate('AddCash', { startNewTransaction: true });
  };

  onPressTab = async index => {
    if (this.props.currentTab === index) return;
    switch (index) {
      case 0:
        this.props.navigation.navigate('Home');
        break;

      case 1:
        this.props.navigation.navigate('Friends');
        break;

      case 2:
        this.props.navigation.navigate('Boosts');
        break;

      case 3:
        this.props.navigation.navigate('Account');
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.heightPlaceholder} />
        <View style={[styles.visibleBar, styles.boxShadow]}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => this.onPressTab(0)}
          >
            <Image
              style={[
                styles.navImage,
                this.props.currentTab === 0
                  ? styles.purpleTint
                  : styles.grayTint,
              ]}
              source={require('../../assets/home.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => this.onPressTab(1)}
          >
            <Image
              style={[
                styles.navImage,
                this.props.currentTab === 1
                  ? styles.purpleTint
                  : styles.grayTint,
              ]}
              source={require('../../assets/friends_1.png')}
            />
          </TouchableOpacity>
          <View style={styles.navButton} />
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => this.onPressTab(2)}
          >
            <View>
              <Image
                style={[
                  styles.navImage,
                  this.props.currentTab === 2
                    ? styles.purpleTint
                    : styles.grayTint,
                ]}
                source={require('../../assets/gift_card_1.png')}
              />
              {this.props.hasBoostAvailable ? (
                <View style={styles.notificationDot}>
                  <View style={styles.notificationDotCenter} />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => this.onPressTab(3)}
          >
            <Image
              style={[
                styles.navImage,
                this.props.currentTab === 3
                  ? styles.purpleTint
                  : styles.grayTint,
              ]}
              source={require('../../assets/account.png')}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.navButtonOnSteroids}
          onPress={() => this.onPressAddCash()}
        >
          <Icon
            name="plus"
            type="feather"
            size={Sizes.NAVIGATION_BAR_HEIGHT * 0.6}
            color="white"
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Sizes.NAVIGATION_BAR_HEIGHT,
    backgroundColor: bgColor,
  },
  heightPlaceholder: {
    height: Sizes.NAVIGATION_BAR_HEIGHT - Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT,
  },
  visibleBar: {
    height: Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
  },
  boxShadow: {
    shadowColor: Colors.RED,
    shadowOffset: { width: 0, height: 1000 },
    shadowOpacity: 0.1,
    shadowRadius: 500,
    elevation: 20,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navButtonOnSteroids: {
    position: 'absolute',
    alignSelf: 'center',
    height: Sizes.NAVIGATION_BAR_HEIGHT,
    width: Sizes.NAVIGATION_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PURPLE,
    borderColor: Colors.WHITE,
    borderWidth: 6,
    borderRadius: Sizes.NAVIGATION_BAR_HEIGHT / 2,
    elevation: 20,
  },
  navImage: {},
  purpleTint: {
    tintColor: Colors.PURPLE,
  },
  grayTint: {
    tintColor: Colors.GRAY,
  },
  notificationDot: {
    width: NOTIFICATION_DOT_SIZE,
    height: NOTIFICATION_DOT_SIZE,
    backgroundColor: Colors.RED,
    position: 'absolute',
    top: -NOTIFICATION_DOT_SIZE / 6,
    right: -NOTIFICATION_DOT_SIZE / 3,
    borderRadius: NOTIFICATION_DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDotCenter: {
    width: NOTIFICATION_DOT_SIZE / 4,
    height: NOTIFICATION_DOT_SIZE / 4,
    backgroundColor: Colors.WHITE,
  },
});

const mapStateToProps = state => ({
  hasBoostAvailable: getHasBoostsAvailable(state),
  onboardStepsRemaining: getOnboardStepsRemaining(state),
});

export default connect(mapStateToProps)(NavigationBar);
