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

class Friends extends React.Component {
  
  async componentDidMount() {
    friendService.fetchFriendList();
  }

  renderFriendItem(friend, index) {
    return (
      <View style={styles.friendItemWrapper} key={friend.friendshipId}>
        <Text style={styles.friendItemIndex}>{index}</Text>
        <View style={styles.friendItemBodyWrapper}>
          <Text style={styles.friendItemName}>{friend.name}</Text>
          <Text style={styles.friendItemSubtitle}>{friend.lastAction}</Text>
        </View>
        <View style={styles.friendItemHeat}>{friend.savingHeat}</View>
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
          <TouchableOpacity style={styles.hasFriendsTopButton}>
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
            {this.props.friends.map((item, index) => this.renderFriendItem(item, index))}
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
          {this.renderNoFriends()}
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
});

export default connect(mapStateToProps)(Friends);
