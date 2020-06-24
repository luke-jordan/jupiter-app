import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import { View, ScrollView, Text, Image, TouchableOpacity, Picker, StyleSheet, Dimensions } from 'react-native';
import { Input, Icon, Button, CheckBox, Overlay } from 'react-native-elements';

import { Colors } from '../util/Values';
import { standardFormatAmountDict, getDivisor } from '../util/AmountUtil';

import FriendSelector from '../elements/friend/FriendSelector';
import FriendFeatureIntroModal from '../elements/friend/FriendFeatureIntroModal';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getProfileData } from '../modules/profile/profile.reducer';
import { getFriendList } from '../modules/friend/friend.reducer';

import { addFriendTournament } from '../modules/friend/friend.actions';
import { friendService } from '../modules/friend/friend.service';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const mapStateToProps = state => ({
  token: getAuthToken(state),
  friends: getFriendList(state),
  profile: getProfileData(state),
});

const mapPropsToDispatch = {
  addFriendTournament,
};

class AddFriendTournament extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      label: '',

      entryAmount: '50',
      currency: 'R',

      gameCategory: 'TAP_SCREEN',
      timeLimit: 10,

      endTime: '1::HOUR',
      percentAward: 1,

      selectedFriends: [],

      loading: false,

      showFeatureInfo: false,
      showCreatedModal: false,

      requiredEntryAmount: '',
    }
  }

  componentDidMount() {
    if (this.props.profile) {
      this.setState({
        label: `${this.props.profile.calledName || this.props.profile.personalName}'s Tournament`,
      });  
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onChangeInput = (value, field) => {
    this.setState({ [field]: value })
  };

  onChangeAmount = text => {
    if (['NA', 'NAN'].includes(text.trim().toUpperCase())) {
      this.setState({
        entryAmount: '',
        notWholeNumber: false,
      });
      return;
    }

    const wholeNumberRegex = /^[0-9\b]+$/;
    if (wholeNumberRegex.test(text) || text.trim().length === 0) {
      this.setState({
        entryAmount: text,
        notWholeNumber: false,
        emptyAmountError: false,
      });
    } else {
      this.setState({
        notWholeNumber: true,
      });
    }
  };

  onChangeAmountEnd = () => {
    if (this.state.entryAmount.trim().length > 0) {
      this.setState({
        entryAmount: parseFloat(this.state.entryAmount).toFixed(0),
      });
    }
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

  onPressCreateTournament = async () => {
    this.setState({ loading: true });

    const gameCategory = this.state.gameCategory.includes('DESTROY_IMAGE') ? 'DESTROY_IMAGE' : this.state.gameCategory;
    const addSavingThreshold = `${this.state.entryAmount}::WHOLE_CURRENCY::ZAR`;

    const gameParams = {
      gameType: gameCategory,
      timeLimitSeconds: parseInt(this.state.timeLimit, 10),
      numberWinners: 1, // by definition
      entryCondition: `save_event_greater_than #{${addSavingThreshold}}`,
    };

    if (gameCategory === 'DESTROY_IMAGE') {
      // eslint-disable-next-line prefer-destructuring
      gameParams.imageToBreak = this.state.gameCategory.split('::')[1];
    }

    const rewardParameters = {
      rewardType: 'POOLED',
      poolContributionPerUser: { amount: this.state.entryAmount, unit: 'WHOLE_CURRENCY', currency: 'ZAR' },
      percentPoolAsReward: parseInt(this.state.percentAward) / 100,
    }

    const [endTimeValue, endTimeUnit] = this.state.endTime.split('::');
    const endTimeMillis = moment().add(endTimeValue, endTimeUnit).valueOf();

    const boostParams = {
      label: this.state.label,
      endTimeMillis,
      friendships: this.state.selectedFriends,
      gameParams,
      rewardParameters,
    };
    
    // console.log('And here you go, assembled params: ', boostParams);
    const resultOfTournamentCreate = await friendService.createFriendTournament({ token: this.props.token, params: boostParams });
    // console.log('And the result of creation: ', resultOfTournamentCreate);

    if (resultOfTournamentCreate) {
      const { boostId, poolContributionPerUser } = resultOfTournamentCreate;
      this.props.addFriendTournament(resultOfTournamentCreate);
      // console.log('Added tournament: ', resultOfTournamentCreate);
      
      const requiredEntryAmount = standardFormatAmountDict(poolContributionPerUser); // as maxes might be in place on backend
      this.setState({ loading: false, showCreatedModal: true, boostId, requiredEntryAmount, poolContributionPerUser });
      // console.log('Finally done');  
    } else {
      this.setState({ loading: false, showCreatedModal: true });
    }
  };

  onCompleteButNotSaving = () => {
    this.setState({ showCreatedModal: false });
    this.props.navigation.navigate('Friends');
  };

  onPressAddSavings = () => {
    this.setState({ showCreatedModal: false }, () =>
      this.props.navigation.navigate('AddCash', {
        preFilledAmount: this.state.poolContributionPerUser.amount / getDivisor(this.state.poolContributionPerUser.unit),
        startNewTransaction: true,
        boostId: this.state.boostId,
      })
    );
  };

  renderPoolPercentOption = (percent) => (
    <CheckBox
      key={percent}
      title={`${percent}%`}
      center
      
      checkedIcon='dot-circle-o'
      uncheckedIcon='circle-o'

      checked={this.state.percentAward === percent}
      onPress={() => this.setState({ percentAward: percent })}

      containerStyle={styles.radioContainer}
      textStyle={styles.radioText}
    />
  )

  extractEndTimeLabel = (endTimeValue) => {
    const [value, unit] = endTimeValue.split('::');
    const unitDesc = value > 1 ? `${unit.toLowerCase()}s` : unit.toLowerCase();
    return `${value} ${unitDesc}`;
  }

  renderPropertyInput() {
    return (
      <View style={styles.propertyInputHolder}>
        <Text style={styles.inputTitle}>
          Give your tournament a name
        </Text>
        <Input
          value={this.state.label}
          placeholder={`${this.props.profile.calledName || this.props.profile.personalName}'s Tournament`}
          onChangeText={text => this.onChangeInput(text, 'label')}
          containerStyle={styles.inputWrapperStyle}
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
        />
        <Text style={styles.inputTitle}>
          To enter everyone must save this much:
        </Text>
        <View style={styles.targetAmountWrapper}>
          <View style={styles.targetWrapperLeft}>
            <Text style={styles.currencyLabel}>{this.state.currency}</Text>
          </View>
          <Input
            keyboardType="numeric"
            value={this.state.entryAmount}
            onChangeText={this.onChangeAmount}
            onEndEditing={this.onChangeAmountEnd}
            inputContainerStyle={styles.amountInputContainerStyle}
            inputStyle={styles.amountInputStyle}
            containerStyle={styles.amountContainerStyle}
          />
        </View>
        {this.state.notWholeNumber ? (
          <View style={styles.wholeNumberOnlyView}>
            <Text style={styles.error}>
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
        <View style={styles.pickerWrapperStyle}>
          <Picker
            selectedValue={this.state.gameCategory}
            onValueChange={itemValue => this.onChangeInput(itemValue, 'gameCategory')}
            mode="dropdown"
            style={styles.pickerStyle}
            itemStyle={styles.pickerItemStyle}
          >
            <Picker.Item label="Tap the screen" value="TAP_SCREEN" />
            <Picker.Item label="Chase the arrow" value="CHASE_ARROW" />
            <Picker.Item label="Break the credit card" value="DESTROY_IMAGE::CREDIT_CARD" />
            {/* <Picker.Item label="Break the loan shark" value="DESTORY_IMAGE::LOAN_SHARK" /> */}
          </Picker>
        </View>
        <Text style={styles.inputTitle}>
          Give the game a time limit
        </Text>
        <View style={styles.pickerWrapperStyle}>
          <Picker
            selectedValue={this.state.timeLimit}
            onValueChange={itemValue => this.onChangeInput(itemValue, 'timeLimit')}
            style={styles.pickerStyle}
            itemStyle={styles.pickerItemStyle}
            mode="dropdown"
          >
            {[10, 20, 30].map((seconds) => (
              <Picker.Item key={seconds} label={`${seconds} seconds`} value={seconds} />
            ))}
          </Picker>
        </View>
        <Text style={styles.inputTitle}>
          When should the tournament end?
        </Text>
        <View style={styles.pickerWrapperStyle}>
          <Picker
            selectedValue={this.state.endTime}
            onValueChange={itemValue => this.onChangeInput(itemValue, 'endTime')}
            mode="dropdown"
            style={styles.pickerStyle}
            itemStyle={styles.pickerItemStyle}
          >
            {['1::HOUR', '1::DAY', '3::DAY'].map((timeValue) => (
              <Picker.Item key={timeValue} label={this.extractEndTimeLabel(timeValue)} value={timeValue} />
            ))}
          </Picker>
        </View>
        <Text style={styles.inputTitle}>
          How much of our saves for this Tournament will the winner get?
        </Text>
        <View style={styles.radioHolder}>
          {[1, 5, 10].map(this.renderPoolPercentOption)}
        </View>
      </View>
    )
  }

  renderInfoModal() {
    const highlightPara = 'For example if 10 buddies save R100 each, and the winner gets 10%, the prize would be R100 (plus Jupiter might chip in)';

    return this.state.showFeatureInfo && (
      <FriendFeatureIntroModal
        isVisible={this.state.showFeatureInfo}
        onRequestClose={() => this.setState({ showFeatureInfo: false })}
        
        featureTitle="Introducing Buddy Tournaments!"
        highlightPara={highlightPara}
        bodyParas={[
          'You can now create your own tournament to play with your buddies',
          'Choose a game, and an amount everyone needs to save to enter. Then add your buddies to the tournament. The winner gets allocated a percentage (between 1-10%) of the total savings entry!',
        ]}
      />
    );
  }

  // should probably consolidate like feature modal
  renderCreatedModal() {
    return this.state.showCreatedModal && (
      <Overlay
        isVisible={this.state.showCreatedModal}
        transparent
        width="90%"
        height="auto"
        animationType="fade"
        onRequestClose={this.onCompleteButNotSaving}
        onBackdropPress={this.onCompleteButNotSaving}
      >
        <View style={styles.modalContainer}>
          <Image 
            source={require('../../assets/thank_you.png')} 
            style={styles.modalHeaderImage}
            resizeMode="contain"
          />
          <Text style={styles.modalHeader}>
            Tournament Created
          </Text>
          <Text style={styles.modalBody}>
          Your buddies will receive an invite with the boost details shortly. Join yourself by
            {' '}<Text style={styles.modalBoldText}>adding your save</Text>{' '} 
          to the collective savings pool. You can save as much as you want, but remember that only the 
          allocated amount of {this.state.requiredEntryAmount} will be added to the tournament.
          </Text>
          {this.state.boostId && (
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
          )}
          <TouchableOpacity style={styles.closeDialog} onPress={this.onCompleteButNotSaving}>
            <Image source={require('../../assets/close.png')} resizeMode="contain" style={{ width: 25 }} />
          </TouchableOpacity>
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
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Buddy Tournament</Text>
          <TouchableOpacity
            style={styles.infoButtonHeader}
            onPress={() => this.setState({ showFeatureInfo: true })}
          >
            <Icon
              name="info"
              type="feather"
              size={25}
              color={Colors.PURPLE}
            />
          </TouchableOpacity>
        </View>
        <ScrollView containerStyle={styles.scrollContainer} style={styles.scrollInternal}>
          
          {/* Once this has been introduced for a while it will go in footer, but for now making it more prominent */}
          <TouchableOpacity style={styles.infoFooterHolder} onPress={() => this.setState({ showFeatureInfo: true })}>
            <Icon
              name="info"
              type="feather"
              size={25}
              color={Colors.PURPLE}
            />
            <Text style={styles.infoFooterText}>
              How do buddy tournaments work?
            </Text>
          </TouchableOpacity>

          {this.renderPropertyInput()}

          <Text style={[styles.propertyInputHolder, styles.inputTitle]}>
            Which of my friends are invited to play?
          </Text>
          <FriendSelector
            friendList={this.props.friends}
            onToggleFriendship={this.onSelectOrDeselectFriend}
          />
          
          <Button
            title="CREATE TOURNAMENT"
            onPress={this.onPressCreateTournament}
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
        {this.state.showFeatureInfo && this.renderInfoModal()}
        {this.state.showCreatedModal && this.renderCreatedModal()}
      </View>
    );
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
    flex: 1,
  },
  infoButtonHeader: {
    paddingRight: 10,
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
    marginTop: 7 * FONT_UNIT,
    marginBottom: 10,
    fontFamily: 'poppins-semibold',
    fontSize: 3.8 * FONT_UNIT,
    color: Colors.MEDIUM_GRAY,
  },
  inputWrapperStyle: {
    backgroundColor: Colors.WHITE,
    minHeight: 50,
    borderRadius: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    paddingTop: 5,
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
  wholeNumberOnlyView: {
    marginTop: 5,
    textAlign: 'left',
  },
  footNote: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 13,
  },
  error: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
  },
  pickerWrapperStyle: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
  },
  pickerStyle: {
    flex: 1,
    width: '100%',
  },
  pickerItemStyle: {
    fontFamily: 'poppins-semibold',
  },
  radioHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioContainer: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    borderWidth: 0,
  },
  radioText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.DARK_GRAY,
  },
  infoFooterHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
    width: '100%',
  },
  infoFooterText: {
    fontSize: 14,
    color: Colors.PURPLE,
    fontFamily: 'poppins-regular',
    paddingLeft: 5,
    textAlign: 'center',
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
    alignItems: 'center',
  },
  modalHeader: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 18,
  },
  modalBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
  closeDialog: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  modalBoldText: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
});

export default connect(mapStateToProps, mapPropsToDispatch)(AddFriendTournament);
