import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon, Input, Button } from 'react-native-elements';

import { Colors } from '../util/Values';
import { ValidationUtil } from '../util/ValidationUtil';

import FriendInviteModal from '../elements/friend/FriendInviteModal';
import { friendService } from '../modules/friend/friend.service';

class AddFriend extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      token: this.props.navigation.getParam('token'),
      emailOrPhoneToAdd: 'failure@jupitersave.com',
      
      showReferralDetails: true,
      showSearchResults: false,
      showSnackbar: false,
      
      loading: false,
      foundUsers: [],

      showFriendInviteModal: false,
      friendInModal: {},

      invalidInputError: false,
      emptyInputError: false,
    };
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onChangeInput = (text) => {
    this.setState({ emailOrPhoneToAdd: text, emptyInputError: false, invalidInputError: false });
  }

  onInputEnd = async () => {
    if (this.state.loading) return;

    if (!this.state.emailOrPhoneToAdd) {
      this.setState({ emptyInputError: true });
      return;
    }

    const valueToSubmit = this.state.emailOrPhoneToAdd.trim().toLowerCase();
    const phoneEmailType = ValidationUtil.validateAndReturnType(valueToSubmit);
    if (phoneEmailType === 'NONE') {
      this.setState({ invalidInputError: true });
      return;
    }

    this.setState({ loading: true, phoneEmailType });
    const resultOfSearch = await friendService.seekPotentialFriend({ token: this.state.token, phoneOrEmail: this.state.emailOrPhoneToAdd });
    this.setState({ loading: false });

    const { result } = resultOfSearch;
    if (result === 'USER_NOT_FOUND') {
      this.setState({
        showReferralDetails: false,
        showSearchResults: true,
        contactType: phoneEmailType === 'EMAIL' ? 'email' : 'SMS',
        foundUsers: [],
      })
    } else {
      this.setState({
        showReferralDetails: false,
        showSearchResults: true,
        foundUsers: [{ targetUserId: resultOfSearch.systemWideUserId, targetUserName: resultOfSearch.targetUserName }],
      })
    }
  }

  onSubmitInviteToKnownUser = async (sharingLevel) => {
    if (!this.state.friendInModal || !this.state.friendInModal.targetUserId) {
      // something went wrong, back out
      this.setState({ showFriendInviteModal: false });
      return;
    }

    const invitationParams = {
      targetUserId: this.state.friendInModal.targetUserId,
      targetPhoneOrEmail: this.state.emailOrPhoneToAdd,
      sharingLevel,
    }

    this.setState({ loading: true });
    const resultOfInvite = await friendService.initiateFriendRequest({ token: this.state.token, ...invitationParams });
    console.log('Result: ', resultOfInvite);
    this.setState({
      loading: false,
      showReferralDetails: true,
      showSearchResults: false,
      foundUsers: [],
      emailOrPhoneToAdd: '',
      showSnackbar: true,
    });

  };

  showInviteDialogForKnownUser = (friendToView) => {
    this.setState({
      showFriendInviteModal: true,
      friendInModal: friendToView,
    })
  }

  proceedToInviteMessage = () => {
    // validation happens above, so can just proceed here
    this.props.navigation.navigate('AddFriendMessage', {
      destinationEmailOrPhone: this.state.emailOrPhoneToAdd,
      destinationContactType: this.state.phoneEmailType,
    });
  };

  renderReferralDescription() {
    return (
      <View style={styles.footerWrapper}>
        <View style={styles.rewardWrapper}>
          <Text style={styles.rewardText}>Invite a buddy and we&apos;ll reward you!</Text>
        </View>
        <Text style={styles.rewardDescription}>
          If they&apos;re new to Jupiter, we’ll add R20.00 to your balance each time a buddy signs up and completes 
          their first save. 
        </Text>
      </View>
    );
  }

  renderInviteBtn(title, onPressFunction) {
    return (
      <Button 
        title={title}
        onPress={onPressFunction}
        titleStyle={styles.sendInviteBtnTitle}
        buttonStyle={styles.sendInviteBtnStyle}
        containerStyle={styles.sendInviteBtnContainerStyle}
        linearGradientProps={{
          colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
        }}
      />
    )
  }

  renderUserFound(friend) {
    return (
      <View style={styles.resultItem} key={friend.targetUserId}>
        <View style={styles.resultItemDetails} key={friend.targetUserId}>
          <Text style={styles.resultItemTitle}>{friend.targetUserName}</Text>
          <Text style={styles.resultItemSubtitle}>{this.state.emailOrPhoneToAdd.trim().toLowerCase()}</Text>
        </View>
        {this.renderInviteBtn("ADD", () => this.showInviteDialogForKnownUser(friend))}
      </View>
    );
  }

  renderUserNotFound() {
    return (
      <View style={styles.resultItem}>
        <View style={styles.resultItemDetails}>
          <Text style={styles.resultItemTitle}>{this.state.emailOrPhoneToAdd.trim().toLowerCase()}</Text>
          <Text style={styles.resultItemSubtitle}>Invite by {this.state.contactType}</Text>
        </View>
        {this.renderInviteBtn("SEND INVITE", this.proceedToInviteMessage)}
      </View>
    );
  }

  renderResultSection() {
    return (
      <View style={styles.resultBox}>
        {this.state.foundUsers && this.state.foundUsers.length > 0 
          ? this.state.foundUsers.map((friend) => this.renderUserFound(friend)) 
          : this.renderUserNotFound()}
      </View>
    )
  }

  renderSnackbar() {
    return (
      <View style={styles.snackbarContainer}>
        <Icon
          type="antdesign"
          name="check"
          color={Colors.WHITE}
          size={20}
          containerStyle={styles.snackbarIcon}
        />
        <Text style={styles.snackbarText}>
          Saving Buddy request sent
        </Text>
        <Icon
          type="antdesign"
          name="close"
          color={Colors.WHITE}
          size={20}
          containerStyle={styles.snackbarIcon}
          onPress={() => this.setState({ showSnackbar: false })}
        />
      </View>
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
          <Text style={styles.headerTitle}>Add Saving Buddies</Text>
        </View>
        <View style={styles.mainBody}>
          {this.state.showSnackbar && this.renderSnackbar()}
          <Input 
            value={this.state.emailOrPhoneToAdd}
            onChangeText={text => this.onChangeInput(text)}
            onEndEditing={this.onInputEnd}
            leftIcon={(
              <Icon
                name="search"
                type="evilicons"
                color={Colors.PURPLE}
                onPress={this.onInputEnd}
              />
            )}
            placeholder="Add Email Address or Phone Number"
            containerStyle={styles.inputWrapperStyle}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
          />
          {this.state.invalidInputError && <Text style={styles.errorText}>Sorry, that does not look like a valid email or mobile number</Text>}
          {this.state.emptyInputError && <Text style={styles.errorText}>Please enter an email address or mobile number</Text>} 
          <Text style={styles.referralNote}>
            Or simply share the referral code below
          </Text>
          <TouchableOpacity style={styles.referralCode}>
            <Text style={styles.referralCodeText}>MEMORY</Text>
            <Icon
              name="copy"
              type="font-awesome"
              size={22}
              color={Colors.PURPLE}
            />
          </TouchableOpacity>
        </View>
        {this.state.loading && (
          <View style={styles.resultBox}><ActivityIndicator size="large" color={Colors.PURPLE} /></View>
        )}
        {this.state.showSearchResults && !this.state.loading && this.renderResultSection()}
        {this.state.showReferralDetails && !this.state.loading && this.renderReferralDescription()}
        {this.state.showFriendInviteModal && (
          <FriendInviteModal 
            isVisible={this.state.showFriendInviteModal}
            inviteType="INITIATING"
            relevantUserName={this.state.friendInModal.targetUserName}
            onRequestClose={() => this.setState({ showFriendInviteModal: false })}
            onSubmitAcceptance={this.onSubmitInviteToKnownUser}
          />
        )}
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
  mainBody: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
    paddingHorizontal: 15,
  },
  inputWrapperStyle: {
    marginTop: 20,
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
    fontSize: 13,
    marginLeft: 5,
  },
  footerWrapper: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  rewardWrapper: {
    backgroundColor: Colors.PURPLE_TRANSPARENT,
    paddingLeft: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  rewardText: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
  },
  rewardDescription: {
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  referralNote: {
    marginTop: 15,
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    width: '100%',
    textAlign: 'center',
  },
  referralCode: {
    marginTop: 5,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  referralCodeText: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    marginRight: 5,
  },
  resultBox: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  resultItem: {
    width: '100%',
    borderBottomColor: Colors.LIGHT_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultItemDetails: {
    paddingVertical: 12,
    paddingStart: 12,
    flex: 1,
  },
  resultItemTitle: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 16,
  },
  resultItemSubtitle: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
  },
  sendInviteBtnContainerStyle: {
    marginRight: 12,
  },
  sendInviteBtnStyle: {
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sendInviteBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    color: Colors.WHITE,
    fontSize: 14,
  },
  snackbarContainer: {
    width: '100%',
    backgroundColor: Colors.HISTORY_GREEN,
    flexDirection: 'row',
    padding: 5,
    borderRadius: 4,
    marginTop: 20,
  },
  snackbarText: {
    flex: 1,
    textAlign: 'left',
    color: Colors.WHITE,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    fontWeight: '600',
  },
  snackbarIcon: {
    marginHorizontal: 5,
  },
  errorText: {
    color: Colors.RED,
    fontFamily: 'poppins-regular',
    fontSize: 13,
    marginTop: 10,
  },
});

export default AddFriend;
