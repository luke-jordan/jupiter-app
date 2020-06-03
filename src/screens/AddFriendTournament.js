import React from 'react';
import { connect } from 'react-redux';

import { View, ScrollView, Text, TouchableOpacity, Picker, StyleSheet } from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';

import { Colors } from '../util/Values';

import FriendSelector from '../elements/friend/FriendSelector';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getFriendList } from '../modules/friend/friend.reducer';

const mapStateToProps = state => ({
  token: getAuthToken(state),
  friends: getFriendList(state),
});

const mapPropsToDispatch = {

};

class AddFriendTournament extends React.Component {

  constructor (props) {
    super(props);

    this.state = {

      label: '',

      entryAmount: '',
      gameCategory: 'CHASE_ARROW',
      timeLimit: 20,

      endTime: '1::HOUR',
      percentAward: 1,

      selectedFriends: [],
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onChangeInput = (value, field) => {
    this.setState({ [field]: value })
  };

  onSelectOrDeselectFriend = (friendshipId) => {
    const { selectedFriends: priorSelection } = this.state;
    let selectedFriends = [];
    if (this.state.selectedFriends.includes(friendshipId)) {
      selectedFriends = priorSelection.filter((existingId) => existingId !== friendshipId);
    } else {
      selectedFriends = [...priorSelection, friendshipId];
    }
    this.setState({ selectedFriends });
  }

  renderPropertyInput() {
    return (
      <View style={styles.propertyInputHolder}>
        <Text style={styles.inputTitle}>
          Give your tournament a name
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
          To enter everyone must first save
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
              Please enter an amount to save
            </Text>
          </View>
        )}
        {!this.state.notWholeNumber && !this.state.emptyAmountError && (
          <View style={styles.wholeNumberOnlyView}>
            <Text style={styles.footNote}>
              The maximum save amount is R100
            </Text>
          </View>
        )}
        <Text style={styles.inputTitle}>
          Pick a game to play
        </Text>
        <Picker>

        </Picker>
        <Text style={styles.inputTitle}>
          Give the game a time limit
        </Text>
        <Picker>

        </Picker>
        <Text style={styles.inputTitle}>
          When should the tournament end?
        </Text>
        <Picker>

        </Picker>
        <Text style={styles.inputTitle}>
          What percentage does the winner receive of the collective saving pot?
        </Text>
        <Picker>

        </Picker>
      </View>
    )
  }

  renderInfoModal() {
    
  }

  renderCreatedModal() {

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
          <Text style={styles.headerTitle}>Create Buddy Tournament</Text>
        </View>
        <ScrollView containerStyle={styles.scrollContainer} style={styles.scrollInternal}>
          {this.renderPropertyInput()}

          <FriendSelector
            friends={this.props.friends}
            onToggleFriendship={this.onSelectOrDeselectFriend}
          />
          
          <Button
            title="CREATE TOURNAMENT"
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
        </ScrollView>
      </View>
    );
  }

}

const styles = StyleSheet.create({

});

export default connect(mapStateToProps, mapPropsToDispatch)(AddFriendTournament);