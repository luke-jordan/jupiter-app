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
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onChangeInput = (value, field) => {
    this.setState({ [field]: value })
  }

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
    const { poolName: name, targetAmount: amount, selectedFriends: friendships, token } = this.state;
    const target = { amount, unit: 'WHOLE_CURRENCY', currency: 'ZAR' };
    const createdSavingPool = await friendService.createSavingPool({ token, name, target, friendships });
    this.props.addSavingPool(createdSavingPool);
    this.setState({
      showCreatedDialog: true,
      savingPoolId: createdSavingPool.savingPoolId,
    });
  };

  onPressAddSavings = () => {
    this.props.navigation.navigate('AddCash', {
      startNewTransaction: true,
      savingPoolId: this.state.savingPoolId,
      priorScreen: 'SavingPotList',
    })
  }

  renderPropertyInput() {
    return (
      <View style={styles.propertyInputHolder}>
        <Input
          value={this.state.name}
          onChangeText={text => this.onChangeInput(text, 'name')}
          placeholder="2021 holiday together"
          containerStyle={styles.inputWrapperStyle}
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
        />
        <View style={styles.targetAmountWrapper}>
          <View style={styles.targetWrapperLeft}>
            <Text style={styles.currencyLabel}>{this.state.currency}</Text>
          </View>
          <Input
            keyboardType="numeric"
            value={this.state.targetAmount}
            onChangeText={text => this.onChangeInput(text, 'targetAmount')}
            onEndEditing={() => this.onChangeAmountEnd()}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            containerStyle={styles.containerStyle}
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
      </View>
    );
  }
};

const styles = StyleSheet.create({

});

export default connect(mapStateToProps, mapPropsToDispatch)(AddSavingPool);
