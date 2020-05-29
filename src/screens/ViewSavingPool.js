/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ListItem, Button, Icon, Overlay } from 'react-native-elements';

import { Colors } from '../util/Values';

import FriendItem from '../elements/friend/FriendItem';
import FriendSelector from '../elements/friend/FriendSelector';

import { getConvertor, standardFormatAmountDict } from '../util/AmountUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getFriendList, getSavingPool } from '../modules/friend/friend.reducer';

import { friendService } from '../modules/friend/friend.service';
import { updateSingleFriendPool } from '../modules/friend/friend.actions';

const mapStateToProps = (state, ownProps) => ({
  token: getAuthToken(state),
  savingPool: getSavingPool(state, ownProps.navigation.getParam('savingPoolId')),
  friendList: getFriendList(state),
});

const mapPropsToDispatch = {
  updateSingleFriendPool,
}

class ViewSavingPool extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loadingDetails: false,
      participants: [],
      transactionRecord: [],

      possibleFriendsToAdd: [],
      friendsToAdd: [],

      showAddFriendOverlay: false,
      submittingEdits: false,
    }
  }

  async componentDidMount() {
    this.fetchDetails();
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressAddSaving = (defaultAmount) => {
    if (!this.props.savingPool) {
      return;
    }

    const addCashParams = {
      startNewTransaction: true,
      savingPoolId: this.props.savingPool.savingPoolId,
      priorScreen: 'SavingPotList',
    };

    if (defaultAmount) {
      addCashParams.preFilledAmount = defaultAmount.amount * getConvertor(defaultAmount.unit, 'WHOLE_CURRENCY');
    }

    this.props.navigation.navigate('AddCash', addCashParams);
  }

  onPressAddFriendToPool = () => {
    this.setState({ showAddFriendOverlay: true, friendsToAdd: [] }); // just to clear
  };

  // we actually don't want a render unless necessary here, hence naughty mutating
  onToggleFriendToAdd = (friendshipId) => {
    if (this.state.friendsToAdd.includes(friendshipId)) {
      const selectedFriends = this.state.friendsToAdd.filter((friendId) => friendId !== friendshipId);
      this.setState({ friendsToAdd: selectedFriends });
    }

    this.state.friendsToAdd.push(friendshipId);
  }

  onConfirmAddFriends = async () => {
    this.setState({ submittingEdits: true });
    const result = await friendService.addFriendToSavingPool({
      token: this.props.token,
      savingPoolId: this.props.savingPool.savingPoolId,
      friendshipsToAdd: this.state.friendsToAdd,
    })

    if (result) {
      // add person to list (just via a new fetch)
      this.fetchDetails();
      this.setState({ submittingEdits: false, showAddFriendOverlay: false });
    }
  }

  async fetchDetails() {
    this.setState({ loadingDetails: true });
    if (!this.props.savingPool) {
      console.error('No saving pool in view props, check state management');
    }

    const { savingPoolId } = this.props.savingPool;
    const savingPoolDetails = await friendService.fetchSavingPoolDetails(this.props.token, savingPoolId);

    const { participatingUsers, transactionRecord: rawTransactionRecord } = savingPoolDetails;

    const transactionRecord = rawTransactionRecord.map((transaction, index) => ({ ...transaction, id: index }))
      .sort((txA, txB) => txB.creationTimeMillis - txA.creationTimeMillis);

    const participantRelId = participatingUsers.
      filter((participant) => participant.relationshipId).
      map((participant) => participant.relationshipId);

    const participants = this.props.friendList.filter((friend) => friend.relationshipId === 'SELF' || participantRelId.includes(friend.relationshipId));
    const possibleFriendsToAdd = savingPoolDetails.createdByFetcher ? 
      this.props.friendList.filter((friend) => friend.relationshipId !== 'SELF' && !participantRelId.includes(friend.relationshipId)) : [];

    this.setState({ loadingDetails: false, transactionRecord, participants, possibleFriendsToAdd })
  }

  renderBasicProperties() {
    if (!this.props.savingPool) {
      return null;
    }

    const { poolName, target, current } = this.props.savingPool;
    return (
      <View style={styles.propertiesHolder}>
        <Text style={styles.titlePrefill}>
          Saving Pots🍯 let you save with your Saving Buddies. You&apos;re saving for:
        </Text>
        <Text style={styles.titleMain}>{poolName}</Text>
        <Text style={styles.amountsDescription}>
          You and your buddies have put in{' '}
          <Text style={styles.amountText}>{standardFormatAmountDict(current, 0)}{' '}</Text>
          towards a target of{' '}
          <Text style={styles.amountText}>{standardFormatAmountDict(target, 0)}</Text>
        </Text>
      </View>
    )
  }

  renderFriends() {
    return (
      <View style={styles.listHolder}>
        <Text style={styles.listTitle}>Buddies saving with you:</Text>
        {this.state.participants.map((friend) => (
          <FriendItem
            friend={friend}
            key={friend.relationshipId}
          />
        ))}
        {this.state.possibleFriendsToAdd.length > 0 && (
          <Button
            title="+ ADD ANOTHER"
            onPress={this.onPressAddFriendToPool}
            titleStyle={styles.addFriendBtnTitleStyle}
            buttonStyle={styles.addFriendBtnStyle}
            containerStyle={styles.addFriendBtnContainerStyle}
          />
        )}
      </View>
    )
  }

  renderNoTransaction() {
    return (
      <ListItem
        containerStyle={styles.txContainerStyle}
        title="No contributions yet!"
        titleStyle={styles.txSaverStyle}
        subtitleStyle={styles.txDateStyle}
        rightElement={(
          <Button
            title="ADD"
            onPress={this.onPressAddSaving}
            titleStyle={styles.matchBtnTitle}
            buttonStyle={styles.matchInviteBtnStyle}
            containerStyle={styles.matchBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
        )}
      />
    )
  }

  renderContributions() {
    return this.state.transactionRecord.map((transaction) => (
      <ListItem
        key={transaction.id}
        containerStyle={styles.txContainerStyle}
        title={`${standardFormatAmountDict(transaction.saveAmount, 0)} from ${transaction.saverName}`}
        subtitle={moment(transaction.creationTimeMillis).fromNow()}
        titleStyle={styles.txSaverStyle}
        subtitleStyle={styles.txDateStyle}
        rightElement={(
          <Button
            title="MATCH"
            onPress={() => this.onPressAddSaving(transaction.saveAmount)}
            titleStyle={styles.matchBtnTitle}
            buttonStyle={styles.matchInviteBtnStyle}
            containerStyle={styles.matchBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
        )}
      />
    ))
  }

  renderTransactions() {
    return (
      <View style={styles.listHolder}>
        <Text style={styles.listTitle}>Contributions to this pot:</Text>
        {this.state.transactionRecord && this.state.transactionRecord.length > 0
          ? this.renderContributions() : this.renderNoTransaction()}
      </View>
    )
  }

  renderAddFriendModal() {
    return (
      <Overlay
        isVisible={this.state.showAddFriendOverlay}
        animationType="fade"
        onBackdropPress={() => this.setState({ showAddFriendOverlay: false })}
        width="90%"
        height="auto"
      >
        <View>
          <ScrollView>
            <FriendSelector
              friendList={this.state.possibleFriendsToAdd}
              onToggleFriendship={this.onToggleFriendToAdd}
            />
          </ScrollView>
          <Button
            title="+ ADD"
            onPress={this.onConfirmAddFriends}
            loading={this.state.submittingEdits}
            titleStyle={styles.addSavingBtnTitle}
            buttonStyle={styles.addSavingBtnStyle}
            containerStyle={styles.addSavingBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
        </View>
      </Overlay>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={35}
              colors={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buddy Saving Pot</Text>
        </View>
        <ScrollView contentContainerStyle={styles.mainView}>
          {this.props.savingPool && this.renderBasicProperties()}
          {this.state.loadingDetails && <ActivityIndicator color={Colors.PURPLE} />}
          {!this.state.loadingDetails && this.renderTransactions()}
          {!this.state.loadingDetails && this.renderFriends()}
        </ScrollView>
        <Button
          title="CONTRIBUTE NOW"
          onPress={this.onPressAddSaving}
          titleStyle={styles.addSavingBtnTitle}
          buttonStyle={styles.addSavingBtnStyle}
          containerStyle={styles.addSavingBtnContainerStyle}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
        {this.state.showAddFriendOverlay && this.renderAddFriendModal()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  header: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 10,
  },
  headerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
  },
  mainView: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignItems: 'center',
    paddingVertical: 14,
  },
  propertiesHolder: {
    width: '100%',
    alignItems: 'center',
  },
  titlePrefill: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.MEDIUM_GRAY,
    marginHorizontal: 15,
    marginTop: 5,
    textAlign: 'center',
  },
  titleMain: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
    marginTop: 12,
    color: Colors.DARK_GRAY,
    marginHorizontal: 15,
    textAlign: 'center',
  },
  amountsDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.MEDIUM_GRAY,
    backgroundColor: Colors.WHITE,
    marginHorizontal: 15,
    textAlign: 'center',
    marginVertical: 10,
    padding: 12,
  },
  amountText: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  listHolder: {
    width: '100%',
    paddingVertical: 10,
  },
  listTitle: {
    width: '100%',
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    textTransform: 'uppercase',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  txContainerStyle: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    minWidth: '100%',
    minHeight: 55,
    marginTop: 5,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  txSaverStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  txDateStyle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
  },
  addSavingBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  addSavingBtnStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  addSavingBtnContainerStyle: {
    marginVertical: 15,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  matchInviteBtnStyle: {
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  matchBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    color: Colors.WHITE,
    fontSize: 14,
  },
  addFriendBtnContainerStyle: {
    width: '100%',
    backgroundColor: Colors.BACKGROUND_GRAY,
    marginTop: 10,
    alignItems: 'center',
  },
  addFriendBtnStyle: {
    backgroundColor: Colors.WHITE,
    width: '60%',
    borderRadius: 4,
    borderColor: Colors.PURPLE,
    borderWidth: 2,
  },
  addFriendBtnTitleStyle: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    fontSize: 14,
  },
});

export default connect(mapStateToProps, mapPropsToDispatch)(ViewSavingPool);