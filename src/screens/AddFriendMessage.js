import React from 'react';
import { connect } from 'react-redux';

import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Switch, Share } from 'react-native';
import { Icon, Input, Button, Overlay } from 'react-native-elements';

import { Colors } from '../util/Values';

import { friendService } from '../modules/friend/friend.service';
import { addFriendRequest } from '../modules/friend/friend.actions';

import { getAuthToken } from '../modules/auth/auth.reducer';

const DEFAULT_EMAIL = `I've been using the Jupiter Savings app because it REWARDS me for saving, gives a GREAT interest rate - AND I can withdraw at any time!
\nI'd love you to join my team as a savings buddy so we can earn EXTRA rewards - and help each other build up our savings along the way!`;

const DEFAULT_SMS = friendService.DEFAULT_TEXT_MESSAGE;

const mapStateToProps = state => ({
  token: getAuthToken(state),
});

const mapDispatchToProps = {
  addFriendRequest,
};

class AddFriendMessage extends React.Component {

  constructor(props) {
    super(props);

    const contactType = this.props.navigation.getParam('destinationContactType') || 'PHONE'; // shorter is better
    const defaultMessage = contactType === 'EMAIL' ? DEFAULT_EMAIL : DEFAULT_SMS;

    this.state = {
      targetContactDetails: this.props.navigation.getParam('destinationEmailOrPhone'),
      message: defaultMessage,
      shareActivity: true,
      shareBalance: false,
      loading: false,
      showFinishedModal: false,
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  changeField = (field, value) => {
    this.setState({ [field]: value });
  }

  submitInvite = async () => {
    const invitationParams = {
      targetPhoneOrEmail: this.state.targetContactDetails,
      sharingMessage: this.state.message,
      sharingLevel: {
        shareActivity: this.state.shareActivity,
        shareAmount: this.state.shareAmount,
      },
    }
    this.setState({ loading: true });
    const resultOfInvite = await friendService.initiateFriendRequest({ token: this.props.token, ...invitationParams });
    console.log('Result: ', resultOfInvite);
    const { request } = resultOfInvite;
    this.props.addFriendRequest(request);
    this.setState({ loading: false, showFinishedModal: true });
  }

  shareInvite = () => {
    // todo : we need to add in the referral code link here
    Share.share({ message: this.state.message });
  }

  renderFinishedModal() {
    return (
      <Overlay
        isVisible={this.state.showFinishedModal}
        animationType="fade"
        width="90%"
        height="auto"
        transparent
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Sent!</Text>
          <Text style={styles.modalBody}>You can also share the invite directly: </Text>
          <Button 
            title="SHARE NOW"
            onPress={this.shareInvite}
            titleStyle={styles.shareInviteBtnTitle}
            buttonStyle={styles.shareInviteBtnStyle}
            containerStyle={styles.shareInviteBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}          
          />
          <Button 
            title="BACK TO FRIENDS"
            onPress={() => this.props.navigation.navigate('Friends')}
            titleStyle={styles.shareInviteBtnTitle}
            buttonStyle={styles.shareInviteBtnStyle}
            containerStyle={styles.shareInviteBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}          
          />
          <Text style={styles.modalBody}>We will let you know when they have signed up</Text>
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
          <Text style={styles.headerTitle}>Add Saving Buddies</Text>
        </View>
        <ScrollView style={styles.mainBodyInner} containerStyle={styles.mainBodyContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>To:</Text>
            <Input
              value={this.state.targetContactDetails}
              onChangeText={(text) => this.changeField('destinationEmail', text)}
              containerStyle={styles.inputWrapperStyle}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle} 
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message:</Text>
            <Input
              value={this.state.message}
              onChangeText={(text) => this.changeField('message', text)}
              multiline
              numberOfLines={8}
              containerStyle={styles.msgWrapperStyle}
              inputContainerStyle={styles.msgContainerStyle}
              inputStyle={styles.msgInputStyle}
              textAlignVertical="top"    
            />
          </View>
          <Text style={styles.shareOptionsLabel}>Share the following with this saving buddy:</Text>
          <View style={styles.sharingOptionWrapper}>
            <Text style={styles.sharingOptionLabel}>When I save</Text>
            <Switch 
              trackColor={Colors.PURPLE} 
              onValueChange={(value) => this.changeField('shareActivity', value)} 
              value={this.state.shareActivity}
            />
          </View>
          <View style={styles.sharingOptionWrapper}>
            <Text style={styles.sharingOptionLabel}>How much I save</Text>
            <Switch
              trackColor={Colors.PURPLE}
              onValueChange={(value) => this.changeField('shareBalance', value)}
              value={this.state.shareBalance}
            />
          </View>
          <Button
            title="INVITE SAVING BUDDY"
            onPress={this.submitInvite}
            loading={this.state.loading}
            titleStyle={styles.sendInviteBtnTitle}
            buttonStyle={styles.sendInviteBtnStyle}
            containerStyle={styles.sendInviteBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
        </ScrollView>
        {this.state.showFinishedModal && this.renderFinishedModal()}
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
  mainBodyContainer: {
    flex: 1,
  },
  mainBodyInner: {
    paddingVertical: 15,
  },
  inputGroup: {
    paddingHorizontal: 15,
  },
  inputLabel: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
  },
  inputWrapperStyle: {
    marginTop: 5,
    backgroundColor: Colors.WHITE,
    minHeight: 50,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 20,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 13,
    marginLeft: 5,
  },
  msgWrapperStyle: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 25,
  },
  msgContainerStyle: {
    borderBottomWidth: 0,
  },
  msgInputStyle: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 13,
    lineHeight: 20,
  },
  shareOptionsLabel: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  sharingOptionWrapper: {
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 15,
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
  sendInviteBtnContainerStyle: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sendInviteBtnStyle: {
    height: 55,
    borderRadius: 10,
  },
  sendInviteBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.WHITE,
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
    marginVertical: 10,
  },
  modalBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    lineHeight: 20,
  },
  shareInviteBtnContainerStyle: {
    marginVertical: 10,
    paddingHorizontal: 15,
    minWidth: '80%',
  },
  shareInviteBtnStyle: {
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  shareInviteBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.WHITE,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddFriendMessage);
