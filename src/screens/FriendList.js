import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { Button, Icon } from 'react-native-elements';

import NavigationBar from '../elements/NavigationBar';
import { Colors } from '../util/Values';

import { friendService } from '../modules/friend/friend.service';
import { getFriendList, getReferralData } from '../modules/friend/friend.reducer';

import { getAuthToken } from '../modules/auth/auth.reducer';

const mapStateToProps = state => ({
  friends: getFriendList(state),
  referralData: getReferralData(state),
  token: getAuthToken(state),
});

const obtainColorForHeat = (friendHeat) => {
  if (friendHeat > 3) {
    return Colors.RED;
  } else if (friendHeat > 2) {
    return Colors.PURPLE;
  } else if (friendHeat > 1) {
    return Colors.GOLD;
  } else {
    return Colors.LIGHT_BLUE;
  }
};

class Friends extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      friends: [
        { personalName: 'Vanessa', familyName: 'Phillips', friendshipId: 'test', savingHeat: 2 },
        { personalName: 'Avishkar', familyName: 'Brijmohun', friendshipId: 'test-2', savingHeat: 5 },
        { personalName: 'Simonee', familyName: 'Pillay-Brijmohun', friendshipId: 'test-3', savingHeat: 3 },
        { personalName: 'Arifperson', familyName: 'Pereira Person Soares Moreno', friendshipId: 'test-4', savingHeat: 0 },
        { personalName: 'Arif', familyName: 'Pereira Soares Moreno', friendshipId: 'test-5', savingHeat: 0 },
      ],
    }
  }
  
  async componentDidMount() {
    // friendService.fetchFriendList();
    // console.log('So far: ', this.state.friends);

    // this.setState({ 
    // });
  }

  renderFriendItem(friend, index) {
    const friendName = `${friend.calledName || friend.personalName} ${friend.familyName}`;
    const lastAction = `Saved on 5 March`;

    return (
      <View style={styles.friendItemWrapper} key={friend.friendshipId}>
        <Text style={styles.friendItemIndex}>{index + 1}</Text>
        <View style={styles.friendItemBodyWrapper}>
          <Text style={styles.friendItemName}>{friendName}</Text>
          <Text style={styles.friendItemSubtitle}>{lastAction}</Text>
        </View>
        <View style={styles.friendItemHeat}>
          <Icon
            name="circle-o"
            type="font-awesome"
            size={30}
            color={obtainColorForHeat(friend.savingHeat)}
          />
        </View>
        <Icon
          name="chevron-right"
          type="evilicon"
          size={30}
          color={Colors.MEDIUM_GRAY}
        />
      </View>
    )
  }

  renderWithFriends() {
    return (
      <>
        <View style={styles.hasFriendsTopButtonWrapper}>
          <TouchableOpacity style={styles.hasFriendsTopButton}>
            <Image
              source={require('../../assets/messages.png')}
              style={styles.buddyRequestIcon}
            />
            <Text style={styles.buddyRequestText}>Buddy Requests</Text>
            <Text style={[styles.buddyRequestCount, styles.redText]}>3</Text>
            <Icon
              name="chevron-right"
              type="evilicon"
              size={30}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
          <View style={styles.internalSeparator} />
          <TouchableOpacity 
            style={styles.hasFriendsTopButton}
            onPress={() => this.props.navigation.navigate('AddFriend')}
          >
            <Image
              source={require('../../assets/messages.png')}
              style={styles.buddyRequestIcon}
            />
            <Text style={styles.buddyRequestText}>Add Savings Buddies</Text>
            <Icon
              name="chevron-right"
              type="evilicon"
              size={30}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.hasFriendsBody}>
          <Text style={styles.hasFriendsTitle}>
            Your buddies
          </Text>
          <View style={styles.friendsListHolder}>
            {this.state.friends.map((item, index) => this.renderFriendItem(item, index))}
          </View>
        </View>
      </>
    )
  }

  renderNoFriends() {
    return (
      <>
        <TouchableOpacity style={styles.buddyRequestWrapper}>
          <Image
            source={require('../../assets/messages.png')}
            style={styles.buddyRequestIcon}
          />
          <Text style={styles.buddyRequestText}>Buddy Requests</Text>
          <Text style={styles.buddyRequestCount}>0</Text>
          <Icon
            name="chevron-right"
            type="evilicon"
            size={30}
            color={Colors.MEDIUM_GRAY}
          />
        </TouchableOpacity>
        <View style={styles.noFriendsBody}>
          <Image 
            source={require('../../assets/friends-illustration.png')}
            styles={styles.noFriendsIllustration}
          />
          <Text style={styles.noFriendHeader}>Start saving with your buddies</Text>
          <Text style={styles.noFriendBody}>
            Motivate each other to save and earn extra boosts through joint challenges and more!
          </Text>
          <Text style={styles.noFriendWhiteBg}>
            Introduce someone new to Jupiter and we’ll add R20.00 to your balance each time a buddy signs up and 
            completes their first save.
          </Text>
          <Button 
            title="+ ADD SAVING BUDDIES"
            onPress={() => this.props.navigation.navigate('AddFriend')}
            titleStyle={styles.addFriendBtnTitle}
            buttonStyle={styles.addFriendBtnStyle}
            containerStyle={styles.addFriendBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}  
          />
          <Text style={styles.referralText}>
            Or simply share the referral code below:
          </Text>
          <TouchableOpacity style={styles.referralCode}>
            <Text style={styles.referralCodeText}>MEMORY</Text>
            <Image
              style={styles.copyIcon}
              source={require('../../assets/copy.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </>
    ) 
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleBar}>
          <Text style={styles.mainTitle}>Saving Buddies</Text>
        </View>
        <ScrollView contentContainerStyle={styles.mainView}>
          {this.state.friends ? this.renderWithFriends() : this.renderNoFriends()}
        </ScrollView>
        <NavigationBar navigation={this.props.navigation} currentTab={1} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  titleBar: {
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingVertical: 12,
  },
  mainTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '600',
  },
  mainView: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignItems: 'center',
    paddingBottom: 14,
  },
  buddyRequestWrapper: {
    marginTop: 12,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  buddyRequestText: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    color: Colors.NEAR_BLACK,
    paddingVertical: 12,
    marginStart: 10,
    flexGrow: 1,
  },
  buddyRequestIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  buddyRequestCount: {
    fontSize: 15,
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    paddingVertical: 12,
  },
  noFriendsBody: {
    alignItems: 'center',
    paddingTop: 20,
  },
  noFriendsIllustration: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  noFriendHeader: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
    marginTop: 12,
    color: Colors.DARK_GRAY,
    marginHorizontal: 15,
    textAlign: 'center',
  },
  noFriendBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.MEDIUM_GRAY,
    marginHorizontal: 15,
    marginTop: 5,
    textAlign: 'center',
  },
  noFriendWhiteBg: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 15,
    backgroundColor: Colors.WHITE,
    padding: 12,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
    marginTop: 12,
  },
  addFriendBtnContainerStyle: {
    marginVertical: 20,
    justifyContent: 'center',
  },
  addFriendBtnStyle: {
    minWidth: 240,
    minHeight: 55,
    borderRadius: 10,
  },
  addFriendBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    color: Colors.WHITE,
    fontSize: 16,
  },
  referralText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
  },
  referralCode: {
    flexDirection: 'row',
    marginTop: 5,
  },
  referralCodeText: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    fontSize: 14,
  },
  copyIcon: {
    width: 22,
    height: 22,
    marginLeft: 5,
  },

  // has friends styles
  hasFriendsTopButtonWrapper: {
    backgroundColor: Colors.WHITE,
    width: '100%',
    marginTop: 14,
  },
  hasFriendsTopButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 14, 
  },
  internalSeparator: {
    marginLeft: 55,
    width: '100%',
    height: 1,
    backgroundColor: Colors.GRAY,
  },
  hasFriendsBody: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  hasFriendsTitle: {
    width: '100%',
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    textTransform: 'uppercase',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  friendItemWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    minWidth: '100%',
    minHeight: 55,
    marginTop: 5,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  friendItemIndex: {
    marginLeft: 18,
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
  },
  friendItemBodyWrapper: {
    marginStart: 18, 
    maxHeight: '100%',
    maxWidth: '70%',
  },
  friendItemName: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  friendItemSubtitle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
  },
  friendItemHeat: {
    flexGrow: 1,
    alignItems: 'flex-end',
  },
});

export default connect(mapStateToProps)(Friends);
