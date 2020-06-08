/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ListItem, Button, Icon, Overlay, Input } from 'react-native-elements';

import { Colors } from '../util/Values';

import FriendItem from '../elements/friend/FriendItem';
import FriendSelector from '../elements/friend/FriendSelector';
import GenericFriendModal from '../elements/friend/GenericFriendModal';

import { getConvertor, standardFormatAmountDict, getDivisor } from '../util/AmountUtil';

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

      canEditPot: false,

      possibleFriendsToAdd: [],
      friendsToAdd: [],

      showAddFriendOverlay: false,
      submittingEdits: false,
    }
  }

  async componentDidMount() {
    this.fetchDetails();
  }

  // this is important because when flipping between pots component may not remount, but pool will change 
  async componentDidUpdate(prevProps) {
    if (!prevProps.savingPool || !this.props.savingPool) {
      this.cleanAndFetchDetails();
    }

    if (prevProps.savingPool.savingPoolId !== this.props.savingPool.savingPoolId) {
      this.cleanAndFetchDetails();
    }
  }

  // eslint-disable-next-line react/sort-comp
  cleanAndFetchDetails() {
    this.setState({ participants: [], transactionRecord: [], canEditPot: false });
    this.fetchDetails();
  }

  onPressBack = () => {
    this.props.navigation.navigate('Friends'); // since we may come here from add cash
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
  };

  onConfirmRemoveFriend = async (friendshipId) => {
    this.setState({ submittingEdits: true });
    const { savingPoolId } = this.props.savingPool;
    const updatedPool = await friendService.removeFriendFromPool({ token: this.props.token, savingPoolId, friendshipId });
    this.props.updateSingleFriendPool(updatedPool);
    await this.fetchDetails(updatedPool);
    this.setState({ submittingEdits: false, showRemoveFriendModal: false });
  };

  onShowRemoveTx = (transactionId) => {
    console.log('Showing: ', transactionId);
    this.setState({ showRemoveTxModal: true, transactionId });
  };

  onConfirmRemoveTx = async (transactionId) => {
    this.setState({ submittingEdits: true });
    const { savingPoolId } = this.props.savingPool;
    const resultOfRemove = await friendService.removeSaveFromPool({ token: this.props.token, savingPoolId, transactionId });
    // as below, alternative is local transformation etc - can do, but later
    if (resultOfRemove) {
      await this.fetchDetails();
    }
    this.setState({ submittingEdits: false, showRemoveTxModal: false });
  };

  onConfirmDeactivate = async () => {
    this.setState({ submittingEdits: true });
    const { savingPoolId } = this.props.savingPool;
    const result = await friendService.deactivateSavingPool({ token: this.props.token, savingPoolId });
    this.setState({ submittingEdits: false, showDeactivateModal: false });
    if (result) {
      // if we do this in here, we are asking for trouble (because the update will cause a background rerender as we are navigating,
      // and that will likely cause various gears to go wrong)
      this.props.navigation.navigate('Friends', { removeSavingPoolId: savingPoolId });
    }
  };

  onShowParamEdits = () => {
    const { poolName, target } = this.props.savingPool;
    const targetAmount = target.amount / getDivisor(target.unit);
    this.setState({
      showEditDetailsModal: true,
      editedDetails: {
        poolName,
        targetAmount: targetAmount.toFixed(0),
      },
    })
  };

  onChangeProperty = (key, text) => {
    const { editedDetails } = this.state;
    editedDetails[key] = text;
    this.setState({ editedDetails });
  }

  onSubmitParamEdits = async () => {
    this.setState({ submittingEdits: true });
    const { savingPoolId, poolName, target } = this.props.savingPool;
    const { editedDetails } = this.state;
    // check if they have changed first
    const propsToChange = {};
    if (poolName !== editedDetails.poolName && editedDetails.poolName.length > 0) {
      propsToChange.name = editedDetails.poolName.trim();
    }

    const revisedAmountInUnit = parseInt(editedDetails.targetAmount, 10) * getDivisor(target.unit);
    if (target.amount !== revisedAmountInUnit && revisedAmountInUnit > 0) {
      propsToChange.target = { ...target, amount: revisedAmountInUnit };
    }

    const updateResult = await friendService.editSavingPoolDetails({ token: this.props.token, savingPoolId, propsToChange });
    if (updateResult) {
      // for the moment, just refetching (not as efficient as should be, but optimize later)
      await this.fetchDetails();
    }
    this.setState({ submittingEdits: false, showEditDetailsModal: false });
  };

  async fetchDetails(recentServerFetch = null) {
    this.setState({ loadingDetails: true });
    if (!this.props.savingPool) {
      console.error('No saving pool in view props, check state management');
    }

    const { savingPoolId } = this.props.savingPool;
    const savingPoolDetails = await (recentServerFetch || friendService.fetchSavingPoolDetails(this.props.token, savingPoolId));

    const { participatingUsers, transactionRecord: rawTransactionRecord } = savingPoolDetails;

    const transactionRecord = rawTransactionRecord.map((transaction, index) => ({ ...transaction, id: index }))
      .sort((txA, txB) => txB.creationTimeMillis - txA.creationTimeMillis);
    
    const participantRelId = participatingUsers.
      filter((participant) => participant.relationshipId).
      map((participant) => participant.relationshipId);

    let participants = participatingUsers;
    let possibleFriendsToAdd = [];

    if (savingPoolDetails.createdByFetcher && this.props.friendList) {
      participants = this.props.friendList.filter((friend) => friend.relationshipId === 'SELF' || participantRelId.includes(friend.relationshipId));
      possibleFriendsToAdd = this.props.friendList.filter((friend) => friend.relationshipId !== 'SELF' && !participantRelId.includes(friend.relationshipId));
    }

    const poolForState = { ...savingPoolDetails };
    Reflect.deleteProperty(poolForState, 'participatingUsers');
    Reflect.deleteProperty(poolForState, 'transactionRecord');
    this.props.updateSingleFriendPool(poolForState);
    
    this.setState({ 
      loadingDetails: false, 
      transactionRecord, 
      participants, 
      possibleFriendsToAdd,
      canEditPot: savingPoolDetails.createdByFetcher, 
    });
  }

  renderBasicProperties() {
    if (!this.props.savingPool) {
      return null;
    }

    const { poolName, target, current } = this.props.savingPool;
    return (
      <View style={styles.propertiesHolder}>
        <Text style={styles.titlePrefill}>
          Saving Pots let you save with your Saving Buddies. You&apos;re saving for:
        </Text>
        <Text style={styles.titleMain}>🍯 {poolName}</Text>
        <View style={styles.descriptionHolder}>
          <Text style={styles.amountsDescription}>
            You and your buddies have put in{' '}
            <Text style={styles.amountText}>{standardFormatAmountDict(current, 0)}{' '}</Text>
            towards a target of{' '}
            <Text style={styles.amountText}>{standardFormatAmountDict(target, 0)}</Text>
          </Text>
          {this.state.possibleFriendsToAdd.length > 0 && (
            <Button
              title="EDIT POT DETAILS"
              onPress={this.onShowParamEdits}
              titleStyle={styles.editDetailsBtnTitleStyle}
              buttonStyle={styles.editDetailsBtnStyle}
              containerStyle={styles.editDetailsBtnContainerStyle}
            />
          )}
        </View>
      </View>
    )
  }

  renderFriends() {
    return (
      <View style={styles.listHolder}>
        <View style={styles.potMemberTitleHolder}>
          <Text style={styles.listTitle}>Savings pot members:</Text>
          {this.state.possibleFriendsToAdd.length > 0 && (
            <View style={styles.potMemberButtons}>
              <Text style={styles.potMemberButtonText} onPress={this.onPressAddFriendToPool}>
                + Add
              </Text>
            </View>
          )}
        </View>
        {this.state.participants.map((friend) => (
          <FriendItem
            friend={friend}
            key={friend.relationshipId}
          />
        ))}
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

  renderContributionSubtitle = (creationTimeMillis, saveBySelf, transactionId) => {
    return saveBySelf ? (
      <Text style={styles.txDateStyle}>
        {moment(creationTimeMillis).fromNow()}{'  '} 
        <Text style={styles.txLinkText} onPress={() => this.onShowRemoveTx(transactionId)}>Remove</Text>
      </Text>
    ) : (
      <Text style={styles.txDateStyle}>{moment(creationTimeMillis).fromNow()}</Text>
    );
  }

  renderContributions() {
    return this.state.transactionRecord.map((transaction) => (
      <ListItem
        key={transaction.id}
        containerStyle={styles.txContainerStyle}
        title={`${standardFormatAmountDict(transaction.saveAmount, 0)} from ${transaction.saverName}`}
        subtitle={this.renderContributionSubtitle(transaction.creationTimeMillis, transaction.saveBySelf, transaction.transactionId)}
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

  // ///////////////////////////////////////////////////////////////////////////
  // //////////////////// LOTS OF MODALS SECTION ///////////////////////////////
  // //////////////////////////////////////////////////////////////////////////

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

  renderEditModal = ({ toggleKey, heading, bodyContent, buttonTitle, onPressButton}) => {
    return ( 
      <GenericFriendModal
        isVisible={this.state[toggleKey]} 
        onPressClose={() => this.setState({ [toggleKey]: false })}
        buttonLoading={this.state.submittingEdits}
        heading={heading}
        buttonTitle={buttonTitle}
        onPressButton={onPressButton}
        bodyContent={bodyContent}
      />
    );
  }

  // todo : create a component for amount input, soon
  renderChangePropsModal() {
    return this.renderEditModal({
      toggleKey: 'showEditDetailsModal',
      heading: 'Edit Pot Details',
      buttonTitle: 'Update details',
      onPressButton: () => this.onSubmitParamEdits(),
      bodyContent: (
        <View style={styles.editDetailsWrapper}>
          <Text style={styles.inputTitle}>
          Saving Pot Name
          </Text>
          <Input
            value={this.state.editedDetails.poolName}
            onChangeText={text => this.onChangeProperty('poolName', text)}
            placeholder="2021 holiday together"
            containerStyle={styles.inputWrapperStyle}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
          />
          <Text style={styles.inputTitle}>
            Your Target
          </Text>
          <View style={styles.targetAmountWrapper}>
            <View style={styles.targetWrapperLeft}>
              <Text style={styles.currencyLabel}>R</Text>
            </View>
            <Input
              keyboardType="numeric"
              value={this.state.editedDetails.targetAmount}
              onChangeText={text => this.onChangeProperty('targetAmount', text)}
              inputContainerStyle={styles.amountInputContainerStyle}
              inputStyle={styles.amountInputStyle}
              containerStyle={styles.amountContainerStyle}
            />
          </View>
        </View>
      ),
    })
  }

  renderRemoveTxModal() {
    return this.renderEditModal({
      toggleKey: 'showRemoveTxModal',
      heading: 'Remove Contribution',
      buttonTitle: 'Yes, remove',
      onPressButton: () => this.onConfirmRemoveTx(this.state.transactionId),
      bodyContent: (
        <Text style={styles.amountsDescription}>
          Are you sure you want to remove this save from the pot?
        </Text>
      ),
    })
  }

  renderDeactivateModal() {
    const bodyContent = (
      <>
        <Text style={styles.amountsDescription}>
          Are you sure you want to deactivate this pot? If you do, you will have to start again 
          saving towards your goal with your buddies.
        </Text>
      </>
    )

    return this.renderEditModal({ 
      toggleKey: 'showDeactivateModal',
      heading: 'Deactivate Pot',
      buttonTitle: 'Yes, deactivate Pot',
      onPressButton: () => this.onConfirmDeactivate(),
      bodyContent,
    })
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
        {this.state.canEditPot && (
          <Text style={styles.footerLink} onPress={() => this.setState({ showDeactivateModal: true })}>
            Deactivate this pot
          </Text>
        )}
        {this.state.showAddFriendOverlay && this.renderAddFriendModal()}
        {this.state.showDeactivateModal && this.renderDeactivateModal()}
        {this.state.showEditDetailsModal && this.renderChangePropsModal()}
        {/* {this.state.showRemoveFriendModal} */}
        {this.state.showRemoveTxModal && this.renderRemoveTxModal()}
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
  descriptionHolder: {
    backgroundColor: Colors.WHITE,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    alignItems: 'center',
  },
  amountsDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
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
    // width: '100%',
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    textTransform: 'uppercase',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  potMemberTitleHolder: {
    flexDirection: 'row',
  },
  potMemberButtons: {
    flex: 1,
    alignItems: 'flex-end',
    paddingEnd: 15,
  },
  potMemberButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.PURPLE,
    textTransform: 'uppercase',
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
  txLinkText: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
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
    width: '100%',
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
  editDetailsBtnContainerStyle: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    marginTop: 10,
    alignItems: 'center',
  },
  editDetailsBtnStyle: {
    backgroundColor: Colors.WHITE,
    borderRadius: 4,
    borderColor: Colors.PURPLE,
    borderWidth: 2,
  },
  editDetailsBtnTitleStyle: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    fontSize: 13,
  },
  footerLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
    width: '100%',
    textAlign: 'center',
    marginBottom: 5,
  },

  // todo : move these into component soon
  editDetailsWrapper: {
    paddingHorizontal: 10,
  },
  inputTitle: {
    marginTop: 5,
    marginBottom: 10,
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
    width: '100%',
    textAlign: 'left',
  },
  inputWrapperStyle: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    minWidth: '100%',
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 14,
    marginLeft: 5,
  },
  targetAmountWrapper: {
    flexDirection: 'row',
    minHeight: 50,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PURPLE,
    borderRadius: 20,
  },
  targetWrapperLeft: {
    width: '13%',
    marginVertical: -1,
    marginLeft: -1,
    backgroundColor: Colors.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  currencyLabel: {
    fontFamily: 'poppins-regular',
    color: Colors.WHITE,
    fontSize: 24,
  },
  amountInputContainerStyle: {
    borderBottomWidth: 0,
  },
  amountInputStyle: {
    marginLeft: 12,
    fontFamily: 'poppins-regular',
    fontSize: 18,
  },
  amountContainerStyle: {
    width: '86%',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(mapStateToProps, mapPropsToDispatch)(ViewSavingPool);
