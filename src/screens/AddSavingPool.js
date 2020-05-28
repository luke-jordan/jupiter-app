import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Icon, Button, Input, Overlay } from 'react-native-elements';

import FriendSelector from '../elements/friend/FriendSelector';

import { Colors } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getFriendList } from '../modules/friend/friend.reducer';
import { addSavingPool } from '../modules/friend/friend.actions';

import { friendService } from '../modules/friend/friend.service';

const mapStateToProps = state => ({
  token: getAuthToken(state),
  friendList: getFriendList(state),
});

const mapPropsToDispatch = {
  addSavingPool,
};

class AddSavingPool extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      currency: 'R',

      selectedFriends: [],

      showCreatedDialog: false,
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onChangeInput = (value, field) => {
    this.setState({ [field]: value })
  };

  onChangeAmountEnd = () => {
    if (this.state.targetAmount.trim().length > 0) {
      this.setState({
        targetAmount: parseFloat(this.state.targetAmount).toFixed(0),
      });
    }
  };

  onSelectOrDeselectFriend = (friendshipId) => {
    const { selectedFriends: priorSelection } = this.state;
    let selectedFriends = [];
    if (this.state.selectedFriends.includes(friendshipId)) {
      selectedFriends = priorSelection.filter((existingId) => existingId !== friendshipId);
    } else {
      selectedFriends = [ ...priorSelection, friendshipId];
    }
    this.setState({ selectedFriends });
  }

  onCreatePot = async () => {
    this.setState({ loading: true });
    const { name, targetAmount: amount, selectedFriends: friendships } = this.state;
    const target = { amount, unit: 'WHOLE_CURRENCY', currency: 'ZAR' };
    const createdSavingPool = await friendService.createSavingPool({ token: this.props.token, name, target, friendships });
    if (!createdSavingPool) {
      console.log('ERROR');
      this.setState({ loading: false });
      return;
    }
    this.props.addSavingPool(createdSavingPool);
    this.setState({
      loading: false,
      showCreatedDialog: true,
      savingPoolId: createdSavingPool.savingPoolId,
    });
  };

  onPressAddSavings = () => {
    this.setState({ showCreatedDialog: false }, () => 
      this.props.navigation.navigate('AddCash', {
        startNewTransaction: true,
        savingPoolId: this.state.savingPoolId,
        priorScreen: 'SavingPotList',
      })
    );
  };

  renderPropertyInput() {
    return (
      <View style={styles.propertyInputHolder}>
        <Text style={styles.inputTitle}>
          Give this pot a name (what&apos;s its purpose?)
        </Text>
        <Input
          value={this.state.name}
          onChangeText={text => this.onChangeInput(text, 'name')}
          placeholder="2021 holiday together"
          containerStyle={styles.inputWrapperStyle}
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
        />
        <Text style={styles.inputTitle}>
          What&apos;s the target for the pot?
        </Text>
        <View style={styles.targetAmountWrapper}>
          <View style={styles.targetWrapperLeft}>
            <Text style={styles.currencyLabel}>{this.state.currency}</Text>
          </View>
          <Input
            keyboardType="numeric"
            value={this.state.targetAmount}
            onChangeText={text => this.onChangeInput(text, 'targetAmount')}
            onEndEditing={() => this.onChangeAmountEnd()}
            inputContainerStyle={styles.amountInputContainerStyle}
            inputStyle={styles.amountInputStyle}
            containerStyle={styles.amountContainerStyle}
          />
        </View>
        {this.state.notWholeNumber ? (
          <View style={styles.wholeNumberOnlyView}>
            <Text style={styles.wholeNumberText}>
              Please enter only a whole number
            </Text>
          </View>
        ) : null}
        {this.state.emptyAmountError && (
          <View style={styles.wholeNumberOnlyView}>
            <Text style={styles.error}>
              Please enter a target amount to set up the savings pot
            </Text>
          </View>
        )}
      </View>
    )
  }

  renderFinishedDialog() {
    return this.state.showCreatedDialog && (
      <Overlay
        isVisible={this.state.showCreatedDialog}
        transparent
        width="90%"
        height="auto"
        animationType="fade"
        onRequestClose={this.onCompleteButNotSaving}
        onBackdropPress={this.onCompleteButNotSaving}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>
            Saving pot created!
          </Text>
          <Text style={styles.modalBody}>
            We have created the saving pool and notified the friends you added 
            to it. Why don&apos;t you get it started by adding the first savings?{' '}
            Remember: any savings you add are your savings, buddies in this pool will
            see the contribution, but cannot withdraw it
          </Text>
          <Button
            title="ADD SAVINGS"
            onPress={this.onPressAddSavings}
            titleStyle={styles.submitBtnTitle}
            buttonStyle={styles.submitBtnStyle}
            containerStyle={styles.submitBtnContainerStyle}      
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
        </View>
      </Overlay>
    )
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
          <Text style={styles.headerTitle}>Create Savings Pot</Text>
        </View>
        <ScrollView containerStyle={styles.scrollContainer} style={styles.scrollInternal}>
          {this.renderPropertyInput()}
          <Text style={[styles.inputTitle, { paddingHorizontal: 15 }]}>
            Which of your buddies will join in?
          </Text>
          <FriendSelector 
            friendList={this.props.friendList}
            onToggleFriendship={this.onSelectOrDeselectFriend}
          />
        </ScrollView>
        <Button 
          title="CREATE POT"
          onPress={this.onCreatePot}
          loading={this.state.loading}
          titleStyle={styles.submitBtnTitle}
          buttonStyle={styles.submitBtnStyle}
          containerStyle={styles.submitBtnContainerStyle}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
        {this.renderFinishedDialog()}
      </View>
    );
  }
};

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
  scrollContainer: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignItems: 'center',
    paddingBottom: 14,
  },
  propertyInputHolder: {
    paddingHorizontal: 15,
  },
  inputTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
  inputWrapperStyle: {
    backgroundColor: Colors.WHITE,
    minHeight: 50,
    borderRadius: 10,
    paddingVertical: 10,
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
    fontSize: 24,
  },
  amountContainerStyle: {
    width: '86%',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  submitBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  submitBtnStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  submitBtnContainerStyle: {
    marginVertical: 15,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingBottom: 15,
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

});

export default connect(mapStateToProps, mapPropsToDispatch)(AddSavingPool);
