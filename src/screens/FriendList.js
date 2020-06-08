import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Image, ActivityIndicator, Share, ImageBackground } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { NavigationEvents } from 'react-navigation';

import NavigationBar from '../elements/NavigationBar';

import FriendItem from '../elements/friend/FriendItem';
import FriendSavingPotList from '../elements/friend/FriendSavingPotList';
import FriendViewModal from '../elements/friend/FriendViewModal';
import FriendAlertModal from '../elements/friend/FriendAlertModal';
import GenericFriendModal from '../elements/friend/GenericFriendModal';

import { Colors } from '../util/Values';
import { LoggingUtil } from '../util/LoggingUtil';

import { standardFormatAmountDict, getDivisor } from '../util/AmountUtil';

import { friendService } from '../modules/friend/friend.service';
import { getFriendList, getReferralData, getFriendRequestList, getFriendAlertData, getListOfSavingPools, getListOfTournaments } from '../modules/friend/friend.reducer';
import { updateFriendList, updateReferralData, updateFriendReqList, removeFriendship, updateHasSeenFriends, updateFriendAlerts, updateFriendSavingPools, updateFriendTournaments, removeFriendSavingPool } from '../modules/friend/friend.actions';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getProfileData } from '../modules/profile/profile.reducer';

const mapStateToProps = state => ({
  friends: getFriendList(state),
  friendRequests: getFriendRequestList(state),
  friendSavingPools: getListOfSavingPools(state),
  friendTournaments: getListOfTournaments(state),
  friendAlertData: getFriendAlertData(state),
  referralData: getReferralData(state),
  profile: getProfileData(state),
  token: getAuthToken(state),
});

const mapDispatchToProps = {
  updateFriendList,
  updateReferralData,
  updateFriendReqList,
  removeFriendship,
  updateHasSeenFriends,
  updateFriendAlerts,
  updateFriendSavingPools,
  updateFriendTournaments,
  removeFriendSavingPool,
};

const DEFAULT_REFERRAL_TEXT = 'Introduce someone new to Jupiter and we’ll connect you as soon as your buddy signs up and completes their first save.';

// todo : in debt paydown, swap to using tinted font
const GOLD_ROCKET = require('../../assets/rocket_gold_outline.png');
const PURPLE_ROCKET = require('../../assets/boost_challenge.png'); 

// for game descriptions (should also move somewhere nice)
const GAME_TEXT = { 'TAP_SCREEN': 'Tap the screen!', 'CHASE_ARROW': 'Chase the arrow!', 'DESTROY_IMAGE': 'Break the card!' };

class Friends extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      referralCode: '',
      referralText: DEFAULT_REFERRAL_TEXT,

      showFriendModal: false,
      friendToShow: {},
      loading: false,

      // selfAsFriend: {},
      friendsToDisplay: [],

      showAlertModal: false,
      alertData: {},
    }
  }
  
  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_FRIEND_LIST');
    
    this.divideAndDisplayFriends();
    this.displayFriendAlertIfNeeded();

    // bit tricky if return from saving pool removal will remount or just do a focus
    // include this here in case the former, as don't want to wait for all calls to complete
    if (this.props.navigation.getParam('removeSavingPoolId')) {
      this.props.removeFriendSavingPool(this.props.navigation.getParam('removeSavingPoolId'));
    }

    await Promise.all([
      this.fetchAndUpdateFriends(), 
      this.fetchAndUpdateFriendRequests(), 
      this.fetchAndUpdateReferralData(),
      this.fetchAndUpdateFriendPools(),
      this.fetchAndUpdateFriendTournaments(),
    ]);

    this.props.updateHasSeenFriends(true);
  }

  async componentDidUpdate(prevProps) {
    const { referralData, friends, friendAlertData } = this.props;
    const { referralData: prevReferralData, friends: prevFriends, friendAlertData: prevAlertData } = prevProps;
    // immutable change means reference changes, so this works
    if (referralData !== prevReferralData) {
      this.setReferralText();
    }

    if (friends !== prevFriends) {
      this.divideAndDisplayFriends();
    }

    // note : home will take care of fetching this on startup, so we don't check again
    if (friendAlertData !== prevAlertData) {
      this.displayFriendAlertIfNeeded();
    }

  }

  // eslint-disable-next-line react/sort-comp
  async handleRefocus() {
    // don't need to do this for referral, which barely ever changes, and pools
    // and tournaments are pretty heavy, so just update them locally (for now)
    if (this.props.navigation.getParam('removeSavingPoolId')) {
      this.props.removeFriendSavingPool(this.props.navigation.getParam('removeSavingPoolId'));
    }

    await Promise.all([this.fetchAndUpdateFriends(), this.fetchAndUpdateFriendRequests()]);
  }

  setReferralText() {
    const { referralData } = this.props;
    const referralCode = referralData && referralData.referralCode ? referralData.referralCode : this.props.profile.referralCode;
    
    if (!referralData || !referralData.referralBoostAvailable) {
      this.setState({ referralCode, referralText: DEFAULT_REFERRAL_TEXT });
      return;
    }

    const { boostAmountOffered } = referralData;
    if (!boostAmountOffered) {
      this.setState({ referralCode, referralText: DEFAULT_REFERRAL_TEXT });
      return;
    }

    const boostAmountFormatted = standardFormatAmountDict(boostAmountOffered);
    const referralText = `Introduce someone new to Jupiter and we’ll add ${boostAmountFormatted} to your balance each time a buddy signs up and completes their first save.`;
    
    this.setState({ referralCode, referralText });
  }

  onPressShareReferral = async () => {
    LoggingUtil.logEvent('USER_SHARED_REFERRAL_CODE');
    const shareMessage = friendService.sharingMessage(this.state.referralCode);
    await Share.share({ message: shareMessage });
  }

  onPressAddFriend = () => {
    this.props.navigation.navigate('AddFriend', { token: this.props.token, referralData: this.props.referralData });
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
    console.log('Result of deactivation: ', resultOfDeactivation);

    if (resultOfDeactivation) {
      this.props.removeFriendship(relationshipId);
    }
    this.setState({ loading: false });
  }

  onPressViewFriendRequests = () => {
    // clear modals, just in case
    this.setState({ showAlertModal: false, showFriendModal: false });
    this.props.navigation.navigate('FriendRequestList');
  }

  onPressEnterTournament = ({ boostId, poolContributionPerUser, percentPoolAsReward }) => {
    const poolContributionAmount = poolContributionPerUser.amount * percentPoolAsReward;
    const poolContributionDict = { ...poolContributionPerUser, amount: poolContributionAmount };
    
    this.setState({
      tournamentBoostId: boostId,
      entryAmountFormatted: standardFormatAmountDict(poolContributionPerUser),
      poolAmountFormatted: standardFormatAmountDict(poolContributionDict),
      addCashPrefilled: poolContributionPerUser.amount / getDivisor(poolContributionPerUser.unit),
      showEnterTournModal: true,
    });
  }

  onConfirmEnterTournament = () => {
    const boostId = this.state.tournamentBoostId;
    this.props.navigation.navigate('AddCash', { 
      preFilledAmount: this.state.addCashPrefilled,
      boostId, 
      startNewTransaction: true,
    });
  }

  divideAndDisplayFriends() {
    const { friends } = this.props;
    if (!friends) {
      return;
    }

    // const self = friends.filter((friend) => friend.relationshipId === 'SELF');
    // const friendsToDisplay = friends.filter((friend) => friend.relationshipId !== 'SELF')
    //   .sort((friendA, friendB) => friendB.savingHeat - friendA.savingHeat);
    const friendsToDisplay = friends.sort((friendA, friendB) => friendB.savingHeat - friendA.savingHeat);
    this.setState({ 
      // selfAsFriend: self ? self[0] : {},
      friendsToDisplay,
    });
  }

  async displayFriendAlertIfNeeded() {
    const { friendAlertData } = this.props;
    if (!friendAlertData) {
      return;
    }
    
    const { alertStatus, logIds } = friendAlertData;
    if (alertStatus === 'NO_ALERTS') {
      return;
    }

    if (alertStatus === 'SINGLE_ALERT' || alertStatus === 'MULTIPLE_ALERTS') {
      this.setState({ showAlertModal: true, alertData: friendAlertData });
      await friendService.postFriendAlertsProcessed(this.props.token, logIds);
      this.props.updateFriendAlerts({ result: 'NO_ALERTS' });
    }
  }

  async fetchAndUpdateFriends() {
    const friends = await friendService.fetchFriendList(this.props.token);
    // console.log('Retrieved from server: ', friends);
    this.props.updateFriendList(friends);
  }

  async fetchAndUpdateReferralData() {
    const referralData = await friendService.fetchReferralData(this.props.token);
    // console.log('Referral data from server: ', referralData);
    this.props.updateReferralData(referralData);
    this.setReferralText();
  }

  async fetchAndUpdateFriendRequests() {
    const friendRequests = await friendService.fetchFriendReqList(this.props.token);
    // console.log('Obtained friend requests: ', friendRequests);
    this.props.updateFriendReqList(friendRequests);
  }

  async fetchAndUpdateFriendPools() {
    const friendSavingPools = await friendService.fetchFriendSavingPools(this.props.token);
    // console.log('Obtained pools: ', friendSavingPools);
    this.props.updateFriendSavingPools(friendSavingPools);
  }

  async fetchAndUpdateFriendTournaments() {
    const fetchedTournaments = await friendService.fetchFriendTournaments(this.props.token);
    console.log('Received: ', fetchedTournaments);
    if (fetchedTournaments.length > 0 || this.props.friendTournaments.length > 0) {
      this.props.updateFriendTournaments(fetchedTournaments);
    }
  }

  renderSavingPools() {
    return this.props.friendSavingPools && this.props.friendSavingPools.length > 0 ? (
      <>
        <Text style={styles.hasFriendsTitle}>
          Buddy saving pots
        </Text>
        <FriendSavingPotList 
          savingPoolList={this.props.friendSavingPools}
          listContainerStyle={styles.listHolder}
          itemContainerStyle={styles.friendItemWrapper}
          onPressPool={(savingPoolId) => this.props.navigation.navigate('ViewSavingPool', { savingPoolId })}
        />
      </>
    ) : null;
  }

  renderTournament(friendTournament) {
    const isStillOffered = friendTournament.boostStatus === 'OFFERED';

    const gameInjunction = isStillOffered ? GAME_TEXT[friendTournament.boostCategory] : 'You played!';
    const endTime = moment(friendTournament.endTime).fromNow();
    const entryAmount = friendTournament.poolContributionPerUser ? standardFormatAmountDict(friendTournament.poolContributionPerUser, 0) : null;

    return (
      <TouchableOpacity
        key={friendTournament.boostId}
        style={styles.friendItemWrapper} 
        onPress={() => this.onPressEnterTournament(friendTournament)}
        disabled={!isStillOffered}
      >
        <Image
          source={isStillOffered ? GOLD_ROCKET : PURPLE_ROCKET}
          style={styles.buddyRequestIcon}
          resizeMode="center"
        />

        <View style={styles.tournamentTextHolder}>
          <Text style={styles.tournamentLabel}>{friendTournament.label}</Text>
          <Text style={styles.tournamentDesc}>{gameInjunction} Tournament ends {endTime}</Text>
        </View>
        {entryAmount && (
          <View style={styles.tournamentAmountHolder}>
            <Text style={styles.tournamentAmountText}>{entryAmount}</Text>
          </View>
        )}
        <Icon
          name="chevron-right"
          type="evilicon"
          size={30}
          color={Colors.MEDIUM_GRAY}
        />
      </TouchableOpacity>
    )
  }

  renderTournamentEnterModal() {
    return (
      <GenericFriendModal
        isVisible={this.state.showEnterTournModal}
        onPressClose={() => this.setState({ showEnterTournModal: false })}
        loading={false}
        heading="Enter Tournament"
        buttonTitle="ADD SAVINGS"
        onPressButton={this.onConfirmEnterTournament}
        bodyContent={(
          <Text style={styles.hasFriendsBodyText}>
            You can enter this Buddy Tournament by making a save of at least {this.state.entryAmountFormatted}.{' '}
            Like with any Buddy Tournament, some of the save goes to the winner (in this case {this.state.poolAmountFormatted}).
            <Text style={styles.modalBoldText}>{' '}Enter now?</Text>
          </Text>
        )}
      />
    );
  }

  renderBuddyTournaments() {
    return this.props.friendTournaments && this.props.friendTournaments.length > 0 ? (
      <>
        <Text style={styles.hasFriendsTitle}>
          Active tournaments
        </Text>
        <View style={styles.listHolder}>
          {this.props.friendTournaments.map((tournament) => this.renderTournament(tournament))}
        </View>
      </>
    ) : null;
  }

  renderFriendItem(friend, index) {
    if (!friend) { // just in case
      return null;
    }

    return (
      <FriendItem 
        key={friend.relationshipId}
        friend={friend}
        index={index}
        chevronVisible
        onPressViewFriend={this.onPressViewFriend}
      />
    );
  }

  renderFriends() {
    return (
      <>
        <Text style={styles.hasFriendsTitle}>
          Your buddies
        </Text>
        <View style={styles.friendsListHolder}>
          {/* {this.state.selfAsFriend ? this.renderFriendItem(this.state.selfAsFriend, 0) : null} */}
          {this.state.friendsToDisplay.map((item, index) => this.renderFriendItem(item, index + 1))}
        </View>
      </>
    )
  }

  renderWithFriends() {
    const hasRequests = this.props.friendRequests && this.props.friendRequests.length > 0;
    return (
      <>
        <Button
          onPress={this.onPressAddFriend}
          title="+ ADD SAVING BUDDIES"
          titleStyle={styles.addFriendBtnTitle}
          buttonStyle={styles.addWithFriendBtnStyle}
          containerStyle={styles.addWithFriendsBtnContainerStyle}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}  
        />
        <View style={styles.hasFriendsTopButtonWrapper}>
          <TouchableOpacity 
            onPress={this.onPressViewFriendRequests}
            style={styles.hasFriendsTopButton}
            // disabled={!this.state.requestDataFetched || this.props.friendRequests.length === 0}
          >
            <Image
              source={require('../../assets/buddy.png')}
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
            onPress={() => this.props.navigation.navigate('AddFriendTournament')}
          >
            <ImageBackground
              source={require('../../assets/gradient_background.png')}
              style={[styles.buddyRequestIcon, styles.buddyRequestBackground]}
            >
              <Image source={require('../../assets/rocket_white_outline.png')} />
            </ImageBackground>
            <Text style={styles.buddyRequestText}>Create Buddy Tournament</Text>
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
            onPress={() => this.props.navigation.navigate('AddSavingPool')}
          >
            <Image
              source={require('../../assets/piggy_bank.png')}
              style={styles.buddyRequestIcon}
            />
            <Text style={styles.buddyRequestText}>Create Savings Pot</Text>
            <Icon
              name="chevron-right"
              type="evilicon"
              size={30}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.hasFriendsBody}>
          {this.renderBuddyTournaments()}
          {this.renderSavingPools()}
          {this.renderFriends()}
          <Text style={{ marginTop: 10, fontFamily: 'poppins-regular', fontSize: 15, color: Colors.MEDIUM_GRAY }}>
            Stay tuned as we add more and more ways you and your saving buddies can motivate each other to save more,
            starting with buddy tournaments -- coming soon! 
          </Text>
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
          {this.state.referralCode ? (
            <TouchableOpacity style={styles.referralCode} onPress={this.onPressShareReferral}>
              <Text style={styles.referralCodeText}>{this.state.referralCode.toUpperCase()}</Text>
              <Image
                style={styles.copyIcon}
                source={require('../../assets/copy.png')}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </>
    ) 
  }

  renderViewFriendModal() {
    return this.state.showFriendModal && (
      <FriendViewModal
        isVisible={this.state.showFriendModal}
        friend={this.state.friendToShow}
        onRequestClose={() => this.setState({ showFriendModal: false, friendToShow: null })}
        onRemoveFriend={this.onPressDeactivateFriend}
      />
    );
  }

  renderAlertModal() {
    return this.state.showAlertModal && (
      <FriendAlertModal
        isVisible={this.state.showAlertModal}
        friendAlertData={this.state.alertData} // direct connection to props causes over-eager updating
        onRequestClose={() => this.setState({ showAlertModal: false })}
        onPressViewRequests={this.onPressViewFriendRequests}
      />
    )
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
        <NavigationEvents onDidFocus={() => this.handleRefocus()} />
        <View style={styles.titleBar}>
          <Text style={styles.mainTitle}>Saving Buddies</Text>
        </View>
        {this.state.loading && this.renderLoading()}
        <ScrollView contentContainerStyle={styles.mainView}>
          {this.state.friendsToDisplay && this.state.friendsToDisplay.length > 0 ? this.renderWithFriends() : this.renderNoFriends()}
        </ScrollView>
        <NavigationBar navigation={this.props.navigation} currentTab={1} />
        {this.renderViewFriendModal()}
        {this.renderAlertModal()}
        {this.state.showEnterTournModal && this.renderTournamentEnterModal()}
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
  buddyRequestBackground: {
    alignItems: 'center',
    justifyContent: 'center',
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

  addWithFriendsBtnContainerStyle: {
    marginTop: 15,
    marginBottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  addWithFriendBtnStyle: {
    minWidth: '100%',
    minHeight: 50,
    borderRadius: 4,
  },

  referralText: {
    marginHorizontal: 15,
    fontSize: 15,
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
  },
  referralCode: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 20,
  },
  referralCodeText: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    fontSize: 16,
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
  hasFriendsBodyText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.MEDIUM_GRAY,
    marginHorizontal: 15,
    marginTop: 15,
    textAlign: 'center',
  },
  redText: {
    color: Colors.RED,
  },
  tournamentTextHolder: {
    marginStart: 18, 
    maxHeight: '100%',
    maxWidth: '70%',
    flex: 1,
  },
  tournamentLabel: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  tournamentDesc: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
    paddingRight: 5,
  },
  tournamentAmountHolder: {
    backgroundColor: Colors.SKY_BLUE,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tournamentAmountText: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    textAlign: 'center',
    color: Colors.PURPLE,
  },
  listHolder: {
    marginBottom: 15,
  },
  modalBoldText: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
