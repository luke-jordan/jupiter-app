import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Image, Switch, ActivityIndicator } from 'react-native';
import { Button, Icon, Overlay } from 'react-native-elements';

import moment from 'moment';

import NavigationBar from '../elements/NavigationBar';
import { Colors } from '../util/Values';

import { standardFormatAmountDict } from '../util/AmountUtil';

import { friendService } from '../modules/friend/friend.service';
import { getFriendList, getReferralData, getFriendRequestList } from '../modules/friend/friend.reducer';
import { updateFriendList, updateReferralData, updateFriendReqList, removeFriendship } from '../modules/friend/friend.actions';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getProfileData } from '../modules/profile/profile.reducer';

const mapStateToProps = state => ({
  friends: getFriendList(state),
  friendRequests: getFriendRequestList(state),
  referralData: getReferralData(state),
  profile: getProfileData(state),
  token: getAuthToken(state),
});

const mapDispatchToProps = {
  updateFriendList,
  updateReferralData,
  updateFriendReqList,
  removeFriendship,
};

const obtainColorForHeat = (friendHeat) => {
  if (friendHeat > 10) {
    return Colors.RED;
  } else if (friendHeat > 5) {
    return Colors.PURPLE;
  } else if (friendHeat > 1) {
    return Colors.GOLD;
  } else {
    return Colors.LIGHT_BLUE;
  }
};

const DEFAULT_REFERRAL_TEXT = 'Introduce someone new to Jupiter and we’ll connect you as soon as your buddy signs up and completes their first save.';

class Friends extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      referralCode: '',
      referralText: DEFAULT_REFERRAL_TEXT,
      requestDataFetched: false,

      showFriendModal: false,
      friendToShow: {},
      loading: false,

      selfAsFriend: {},
      friendsToDisplay: [],
    }
  }
  
  async componentDidMount() {
    this.divideAndDisplayFriends();
    await Promise.all([this.fetchAndUpdateFriends(), this.fetchAndUpdateFriendRequests(), this.fetchAndUpdateReferralData()]);
  }

  async componentDidUpdate(prevProps) {
    const { referralData, friends } = this.props;
    const { referralData: prevReferralData, friends: prevFriends } = prevProps;
    // immutable change means reference changes, so this works
    if (referralData !== prevReferralData) {
      this.setReferralText();
    }

    if (friends !== prevFriends) {
      this.divideAndDisplayFriends();
    }
  }

  setReferralText() {
    const referralCode = this.props.referralData && this.props.referralData.referralCode ? this.props.referralData.referralCode : this.props.profile.referralCode;
    
    if (!this.props.referralData || !this.props.referralData.referralBoostAvailable) {
      this.setState({ referralCode, referralText: DEFAULT_REFERRAL_TEXT });
    }

    const { boostAmountOffered } = this.props.referralData;
    const boostAmountFormatted = standardFormatAmountDict(boostAmountOffered);
    const referralText = `Introduce someone new to Jupiter and we’ll add ${boostAmountFormatted} to your balance each time a buddy signs up and completes their first save.`;
    
    this.setState({ referralCode, referralText });
  }

  onPressAddFriend = () => {
    this.props.navigation.navigate('AddFriend', { token: this.props.token });
  }

  onPressViewFriend = (friend) => {
    this.setState({
      showFriendModal: true,
      friendToShow: friend,
    })
  }

  onPressDeactivateFriend = async () => {
    this.setState({ showFriendModal: false, friendToShow: {}, loading: true });
    const { relationshipId } = this.state.friendToShow;
    const resultOfDeactivation = await friendService.deactivateFriendship(this.props.token, relationshipId);
    if (resultOfDeactivation === 'SUCCESS') {
      this.props.removeFriendship(relationshipId);
    }
    this.setState({ loading: false });
  }

  onPressViewFriendRequests = () => {
    this.props.navigation.navigate('FriendRequestList');
  }

  divideAndDisplayFriends() {
    const { friends } = this.props;
    if (!friends) {
      return;
    }

    const self = friends.filter((friend) => friend.relationshipId === 'SELF');
    const friendsToDisplay = friends.filter((friend) => friend.relationshipId !== 'SELF');
    this.setState({ 
      selfAsFriend: self ? self[0] : {},
      friendsToDisplay,
    });
  }

  async fetchAndUpdateFriends() {
    const friends = await friendService.fetchFriendList(this.props.token);
    // console.log('Retrieved from server: ', friends);
    this.props.updateFriendList(friends);
  }

  async fetchAndUpdateReferralData() {
    console.log('Would fetch referral data');
    // const referralData = await friendService.fetchReferralData(this.props.token);
    // console.log('Referral data from server: ', referralData);
    // this.props.updateReferralData(referralData);
    // this.setReferralText();
  }

  async fetchAndUpdateFriendRequests() {
    const friendRequests = await friendService.fetchFriendReqList(this.props.token);
    // console.log('Obtained friend requests: ', friendRequests);
    this.props.updateFriendReqList(friendRequests);
  }

  renderFriendItem(friend, index) {
    // console.log('Rendering: ', friend);
    const friendName = friend.relationshipId === 'SELF' ? 'You' :
      `${friend.calledName || friend.personalName} ${friend.familyName}`;
    
    const { savingHeat, lastActivity } = friend;

    let lastAction = null;
    if (lastActivity && lastActivity.USER_SAVING_EVENT && lastActivity.USER_SAVING_EVENT.creationTime) {
      lastAction = `Saved on ${moment(lastActivity.USER_SAVING_EVENT.creationTime).format('D MMMM')}`
    }

    return (
      <TouchableOpacity 
        style={styles.friendItemWrapper} 
        key={friend.relationshipId}
        onPress={() => this.onPressViewFriend(friend)}
        disabled={friend.relationshipId === 'SELF'}
      >
        <Text style={styles.friendItemIndex}>{index}</Text>
        <View style={styles.friendItemBodyWrapper}>
          <Text style={styles.friendItemName}>{friendName}</Text>
          {lastAction && <Text style={styles.friendItemSubtitle}>{lastAction}</Text>}
        </View>
        <View style={styles.friendItemHeat}>
          <Icon
            name="circle-o"
            type="font-awesome"
            size={30}
            color={obtainColorForHeat(savingHeat)}
          />
        </View>
        <Icon
          name="chevron-right"
          type="evilicon"
          size={30}
          color={Colors.MEDIUM_GRAY}
        />
      </TouchableOpacity>
    )
  }

  renderWithFriends() {
    const hasRequests = this.props.friendRequests && this.props.friendRequests.length > 0;
    return (
      <>
        <View style={styles.hasFriendsTopButtonWrapper}>
          <TouchableOpacity 
            onPress={this.onPressViewFriendRequests}
            style={styles.hasFriendsTopButton}
            // disabled={!this.state.requestDataFetched || this.props.friendRequests.length === 0}
          >
            <Image
              source={require('../../assets/messages.png')}
              style={styles.buddyRequestIcon}
            />
            <Text style={styles.buddyRequestText}>Buddy Requests</Text>
            <Text style={hasRequests ? [styles.buddyRequestCount, styles.redText] : styles.buddyRequestCount}>
              {hasRequests ? this.props.friendRequests.length : 0}
            </Text>
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
            onPress={this.onPressAddFriend}
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
            {this.renderFriendItem(this.state.selfAsFriend, 0)}
            {this.state.friendsToDisplay.map((item, index) => this.renderFriendItem(item, index + 1))}
          </View>
        </View>
      </>
    )
  }

  renderNoFriends() {
    const hasRequests = this.props.friendRequests && this.props.friendRequests.length > 0;
    return (
      <>
        <TouchableOpacity 
          style={styles.buddyRequestWrapper}
          // disabled={!this.state.requestDataFetched || this.props.friendRequests.length === 0}
          onPress={this.onPressViewFriendRequests}
        >
          <Image
            source={require('../../assets/messages.png')}
            style={styles.buddyRequestIcon}
          />
          <Text style={styles.buddyRequestText}>Buddy Requests</Text>
          <Text style={hasRequests ? [styles.buddyRequestCount, styles.redText] : styles.buddyRequestCount}>
            {hasRequests ? this.props.friendRequests.length : 0}
          </Text>
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
            {this.state.referralText}
          </Text>
          <Button 
            title="+ ADD SAVING BUDDIES"
            onPress={this.onPressAddFriend}
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
            <Text style={styles.referralCodeText}>{this.state.referralCode ? this.state.referralCode.toUpperCase() : 'RANDELAS'}</Text>
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

  renderViewFriendModal() {
    return this.state.showFriendModal && (
      <Overlay
        isVisible={this.state.showFriendModal}
        animationType="fade"
        height="auto"
        width="90%"
        onRequestClose={() => this.setState({ showFriendModal: false, friendToShow: null })}
        onBackdropPress={() => this.setState({ showFriendModal: false, friendToShow: null })}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>
            {this.state.friendToShow.calledName || this.state.friendToShow.personalName}{' '}{this.state.friendToShow.familyName}
          </Text>
          <Text style={styles.modalBody}>
            Your saving buddy&apos;s saving heat is {this.state.friendToShow.savingHeat}. You share with them:
          </Text>
          <View style={styles.sharingOptionWrapper}>
            <Text style={styles.sharingOptionLabel}>When you save</Text>
            <Switch 
              trackColor={Colors.PURPLE} 
              value={this.state.friendToShow.shareActivity}
            />
          </View>
          <View style={styles.sharingOptionWrapper}>
            <Text style={styles.sharingOptionLabel}>How much you save</Text>
            <Switch
              trackColor={Colors.PURPLE}
              value={this.state.friendToShow.shareAmount}
            />
          </View>
          <Text style={styles.modalFooterText}>
            You can remove this saving buddy. Note: this cannot be undone, except by sending a new buddy request.
          </Text>
          <Text style={styles.modalFooterLink} onPress={this.onPressDeactivateFriend}>
            Deactivate friendship
          </Text>
        </View>
      </Overlay>
    );
  }

  renderLoading() {
    return (
      <View style={styles.titleBar}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleBar}>
          <Text style={styles.mainTitle}>Saving Buddies</Text>
        </View>
        {this.state.loading && this.renderLoading()}
        <ScrollView contentContainerStyle={styles.mainView}>
          {this.state.friendsToDisplay && this.state.friendsToDisplay.length > 0 ? this.renderWithFriends() : this.renderNoFriends()}
        </ScrollView>
        <NavigationBar navigation={this.props.navigation} currentTab={1} />
        {this.renderViewFriendModal()}
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
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    maxWidth: '90%',
  },  
  modalHeader: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  modalBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
  sharingOptionWrapper: {
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: Colors.LIGHT_GRAY,
    borderBottomWidth: 1,
  },
  sharingOptionLabel: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 14,
    flex: 1,
  },
  modalFooterText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
    marginTop: 10,
    lineHeight: 20,
  },
  modalFooterLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
    textAlign: 'center',
    marginTop: 10,
  },
  redText: {
    color: Colors.RED,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
