import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity } from 'react-native';
import { Colors, Sizes } from '../util/Values';
import { Icon } from 'react-native-elements';
import { NavigationUtil } from '../util/NavigationUtil';

export default class NavigationBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {

  }

  onPressAddCash = () => {
    this.props.navigation.navigate('AddCash');
  }

  onPressTab = async (index) => {
    switch (index) {
      case 0:
      break;

      case 1:
      break;

      case 2:
      break;

      case 3:
      AsyncStorage.removeItem("userInfo");
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Splash');
      break;

      default:
      break;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.heightPlaceholder} />
        <View style={styles.visibleBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => this.onPressTab(0)}>
            <Image style={[styles.navImage, this.props.currentTab == 0 ? styles.purpleTint : styles.grayTint]} source={require('../../assets/home.png')}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => this.onPressTab(1)}>
            <Image style={[styles.navImage, this.props.currentTab == 1 ? styles.purpleTint : styles.grayTint]} source={require('../../assets/friends_1.png')}/>
          </TouchableOpacity>
          <View style={styles.navButton} />
          <TouchableOpacity style={styles.navButton} onPress={() => this.onPressTab(2)}>
            <Image style={[styles.navImage, this.props.currentTab == 3 ? styles.purpleTint : styles.grayTint]} source={require('../../assets/gift_card_1.png')}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => this.onPressTab(3)}>
            <Image style={[styles.navImage, this.props.currentTab == 4 ? styles.purpleTint : styles.grayTint]} source={require('../../assets/wallet_7.png')}/>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.navButtonOnSteroids} onPress={() => this.onPressAddCash()}>
          <Icon
            name='plus'
            type='feather'
            size={Sizes.NAVIGATION_BAR_HEIGHT * 0.6}
            color='white'
          />
        </TouchableOpacity>
      </View>
    );
  }
}

// </Mutation>

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Sizes.NAVIGATION_BAR_HEIGHT,
    backgroundColor: '#00000000',
  },
  heightPlaceholder: {
    height: Sizes.NAVIGATION_BAR_HEIGHT - Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT,
  },
  visibleBar: {
    height: Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT,
    backgroundColor: 'white',
    flexDirection: 'row',
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
    borderColor: 'white',
    borderWidth: 6,
    borderRadius: Sizes.NAVIGATION_BAR_HEIGHT / 2,
  },
  navImage: {

  },
  purpleTint: {
    tintColor: Colors.PURPLE,
  },
  grayTint: {
    tintColor: Colors.GRAY,
  },
});
