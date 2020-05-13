import React from 'react';
import { connect } from 'react-redux';

import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, Icon, Overlay, Input } from 'react-native-elements';

import moment from 'moment';

import { Colors } from '../util/Values';

import { friendService } from '../modules/friend/friend.service';
import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getFriendRequestList } from '../modules/friend/friend.reducer';

import { updateFriendReqList, removeFriendRequest, addFriendship } from '../modules/friend/friend.actions';
import FriendInviteModal from '../elements/friend/FriendInviteModal';

const mapStateToProps = state => ({
  token: getAuthToken(state),
  friendRequests: getFriendRequestList(state),
});

const mapPropsToDispatch = {
  updateFriendReqList,
  removeFriendRequest,
  addFriendship,
}

const shareItemsDescription = (shareItems) => {
  if (!shareItems || shareItems.length === 0) {
    return 'just your saving heat';
  }

  const shareDesc = [];
  if (shareItems.includes('LAST_ACTIVITY')) {
    shareDesc.push('when you last saved');
  }
  if (shareItems.includes('LAST_AMOUNT')) {
    shareDesc.push('the last amount you saved')
  }

  return shareDesc.length > 0 ? shareDesc.join(' and ') : 'your saving heat';
};

class FriendRequestList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sentRequests: [],
      receivedRequests: [],

      showAcceptModal: false,
      showIgnoreModal: false,
      
      showSentInviteModal: false,
      showInputRequestCodeModal: false,
      loadingRequestCode: false,

      showFinishedModal: false,
      // finishedModalMessage: '',

      requestBeingHandled: {},
    }
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_FRIEND_REQUEST_LIST');
    this.splitFriendRequests();
    // todo : make this only call if the friend list request did not complete 
    const requestList = await friendService.fetchFriendReqList(this.props.token);
    this.props.updateFriendReqList(requestList);
  }

  async componentDidUpdate(prevProps) {
    const { friendRequests } = this.props;
    const { friendRequests: prevFriendRequests } = prevProps;
    if (friendRequests !== prevFriendRequests) {
      this.splitFriendRequests();
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  closeDialogs = (showFinishedModal = false) => {
    this.setState({ requestBeingHandled: {}, showAcceptModal: false, showIgnoreModal: false, showSentInviteModal: false, showFinishedModal })
  }

  onPressAcceptFriendRequest = (request) => {
    this.setState({ requestBeingHandled: request, showAcceptModal: true });
  }

  onConfirmAcceptRequest = async (sharingLevel) => {
    // console.log('Here we go, sharing level: ', sharingLevel);
    const { requestId } = this.state.requestBeingHandled;
    // console.log('Accepting request with ID: ', requestId);  
    LoggingUtil.logEvent('USER_ACCEPTED_FRIEND_REQUEST');
    const acceptResult = await friendService.acceptFriendRequest(this.props.token, requestId, sharingLevel);
    // console.log('Acceptance result: ', acceptResult);
    if (!acceptResult) {
      // handle error
      this.closeDialogs(false);
      return;
    }

    this.props.removeFriendRequest(requestId);
    this.props.addFriendship(acceptResult);
    this.setState({ acceptedFriend: acceptResult });
    this.closeDialogs(true);
  }

  onPressIgnoreFriendRequest = (request) => {
    LoggingUtil.logEvent('USER_IGNORED_FRIEND_REQUEST');
    this.setState({ requestBeingHandled: request, showIgnoreModal: true });
  }

  onConfirmIgnoreRequest = async () => {
    // console.log('Okay ignoring, request: ', this.state.requestBeingHandled);
    const { requestId } = this.state.requestBeingHandled;
    const ignoreResult = await friendService.ignoreFriendRequest(this.props.token, requestId);
    if (ignoreResult) {
      this.props.removeFriendRequest(requestId);
    }
    this.closeDialogs();
  }

  onPressSentRequest = (request) => {
    this.setState({ requestBeingHandled: request, showSentInviteModal: true });
  }

  onConfirmCancelSentRequest = async () => {
    // console.log('Cancelling request!');
    const { requestId } = this.state.requestBeingHandled;
    const cancelResult = await friendService.cancelSentFriendRequest(this.props.token, requestId);
    // console.log('Result of cancel: ', cancelResult);
    if (cancelResult) {
      this.props.removeFriendRequest(requestId); // component update will automatically split again
    }
    this.closeDialogs();
  }

  onSubmitRequestCode = async () => {
    this.setState({ loadingRequestCode: true });
    
    // console.log('Submitting request code');
    const requestCodeResult = await friendService.connectFriendRequest(this.props.token, this.state.requestCodeEnterred);
    // console.log('Result of code seek: ', requestCodeResult);

    if (requestCodeResult) {
      // might as well refresh it (in future might make more efficient)
      const requestList = await friendService.fetchFriendReqList(this.props.token);
      this.props.updateFriendReqList(requestList);
      this.setState({ loadingRequestCode: false, showInputRequestCodeModal: false, requestCodeNotFound: false });
      return;
    }
    
    this.setState({ loadingRequestCode: false, requestCodeNotFound: true });
  }

  splitFriendRequests() {
    // console.log('All requests: ', this.props.friendRequests);
    if (!this.props.friendRequests) {
      return;
    }

    const sentRequests = this.props.friendRequests.filter((req) => req.type === 'INITIATED');
    const receivedRequests = this.props.friendRequests.filter((req) => req.type === 'RECEIVED');
    // console.log('Received requests: ', receivedRequests);
    this.setState({ sentRequests, receivedRequests });
  }

  renderSingleSentRequest(request, index) {
    const targetName = `${request.calledName || request.personalName} ${request.familyName}`;
    return (
      <View 
        style={index !== this.state.sentRequests.length - 1 
          ? [styles.requestContainer, styles.requestWithSeparator] : styles.requestContainer} 
        key={request.requestId}
      >
        <View style={styles.requestTextHolder}>
          <Text style={styles.requestPersonName}>
            {request.personalName ? targetName : request.contactMethod} 
          </Text>
          {request.personalName ? <Text style={styles.requestPersonSubtitle}>{request.contactMethod}</Text> : null}
        </View>
        <TouchableOpacity style={styles.requestButtonHolder} onPress={() => this.onPressSentRequest(request)}>
          <Icon
            name="clock"
            type="evilicon"
            color={Colors.PURPLE}
            size={30}
          />
          <Text style={styles.requestTxtButtonText}>
            PENDING
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderSentRequests() {
    return (
      <>
        <Text style={styles.subsectionTitle}>
          Sent requests
        </Text>
        {this.state.sentRequests.map((request, index) => this.renderSingleSentRequest(request, index))}
        <View style={styles.padder} />
      </>
    )
  }

  renderSingleReceivedRequest(request, index) {
    return (
      <View 
        style={index !== this.state.receivedRequests.length - 1 
          ? [styles.requestContainer, styles.requestWithSeparator] : styles.requestContainer} 
        key={request.requestId}
      >
        <View style={styles.requestTextHolder}>
          <Text style={styles.requestPersonName}>
            {request.calledName || request.personalName}{' '}{request.familyName} 
          </Text>
          <Text style={styles.requestPersonSubtitle}>
            {request.numberOfMutualFriends || 0} mutual friends
          </Text>
        </View>
        <View style={styles.requestButtonHolder}>
          <TouchableOpacity onPress={() => this.onPressIgnoreFriendRequest(request)}>
            <Text style={styles.requestTxtButtonText}>IGNORE</Text>
          </TouchableOpacity>
          <Button 
            title="ACCEPT"
            onPress={() => this.onPressAcceptFriendRequest(request)}
            buttonStyle={styles.acceptBtnStyle}
            titleStyle={styles.acceptBtnTitleStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}    
          />
        </View>
      </View>
    )
  }

  renderReceivedRequests() {
    return (
      <>
        {this.state.receivedRequests.map((request, index) => this.renderSingleReceivedRequest(request, index))}
      </>
    )
  }

  renderAcceptanceModal() {
    return this.state.showAcceptModal && (
      <FriendInviteModal 
        isVisible={this.state.showAcceptModal}
        inviteType="RECEIVING"
        relevantUserName={this.state.requestBeingHandled ? this.state.requestBeingHandled.calledName : ''}
        onRequestClose={() => this.setState({ showAcceptModal: false })}
        onSubmitAcceptance={this.onConfirmAcceptRequest}
      />
    );
  }

  renderIgnoreModal() {
    return this.state.showIgnoreModal && (
      <Overlay
        isVisible={this.state.showIgnoreModal}
        transparent
        width="90%"
        height="auto"
        animationType="fade"
        onRequestClose={() => this.setState({ showIgnoreModal: false })}
        onBackdropPress={() => this.setState({ showIgnoreModal: false })}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>
            Ignore request
          </Text>
          <Text style={styles.modalBody}>
            Are you sure you want to ignore this request? You will not be able to 
            undo this (but the sender will not be notified you have decided to ignore)
          </Text>
          <Button
            title="CONFIRM"
            onPress={this.onConfirmIgnoreRequest}
            loading={this.state.loading}
            titleStyle={styles.ignoreBtnTitleStyle}
            buttonStyle={styles.ignoreBtnStyle}
            containerStyle={styles.ignoreBtnContainerStyle}
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

  renderSentInviteModal() {    
    return this.state.showSentInviteModal && (
      <Overlay
        isVisible={this.state.showSentInviteModal}
        width="90%"
        height="auto"
        animationType="auto"
        onRequestClose={() => this.setState({ showSentInviteModal: false })}
        onBackdropPress={() => this.setState({ showSentInviteModal: false })}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Sent invite</Text>
          <Text style={styles.modalBody}>
            You sent this invite {moment(this.state.requestBeingHandled.creationTime).fromNow()}.{' '}
            You asked to share {shareItemsDescription(this.state.requestBeingHandled.shareItems)}. You can no 
            longer change this invitation, but you can cancel it.
          </Text>
          <Text style={styles.modalFooterLink} onPress={this.onConfirmCancelSentRequest}>
            Cancel invitation
          </Text>
        </View>
      </Overlay>
    )
  }

  renderRequestCodeInput() {
    return (
      <>
        <Text style={styles.modalBody}>
          Please enter the request code you were sent as part of your invite:
        </Text>
        <Input 
          value={this.state.requestCodeEnterred}
          onChangeText={text => this.setState({ requestCodeEnterred: text })}
          placeholder="Enter Request Code"
          containerStyle={styles.requestCodeInputWrapperStyle}
          inputContainerStyle={styles.requestCodeInputContainerStyle}
          inputStyle={styles.requestCodeInputStyle}
        />
        <Button 
          title="CHECK FOR REQUEST"
          loading={this.state.loadingRequestCode}
          onPress={this.onSubmitRequestCode}
          titleStyle={styles.requestCodeTitleStyle}
          buttonStyle={styles.requestCodeBtnStyle}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
      </>
    );
  }

  renderRequestCodeNotFound() {
    return (
      <>
        <Text style={styles.codeNotFoundSubTitle}>
          The request code you entered could unfortunately not be found.
        </Text>
        <Text style={styles.codeNotFoundBody}>
          Please ask your buddy to invite you again with the email or phone number you use to login to Jupiter.
        </Text>
        <Text style={styles.codeNotFoundBody}>
          - OR -
        </Text>
        <Text style={styles.supportLinkText}>
          Contact support
        </Text>
      </>
    );
  }

  renderInputRequestCodeModal() {
    return this.state.showInputRequestCodeModal && (
      <Overlay
        isVisible={this.state.showInputRequestCodeModal}
        width="90%"
        height="auto"
        animationType="fade"
        onBackdropPress={() => this.setState({ showInputRequestCodeModal: false, requestCodeNotFound: false })}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Check for Buddy Request</Text>
          {this.state.requestCodeNotFound ? this.renderRequestCodeNotFound() : this.renderRequestCodeInput()}
        </View>
      </Overlay>
    )
  }

  renderFinishedModal() {
    return this.state.showFinishedModal && (
      <Overlay
        isVisible={this.state.showFinishedModal}
        width="90%"
        height="auto"
        animationType="fade"
        onBackdropPress={() => this.setState({ showFinishedModal: false })}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Done!</Text>
          <Text style={styles.modalBody}>
            You are now connected to {this.state.acceptedFriend.calledName}. Soon, you will be able 
            to challenge each other to saving tournaments, and be eligible for group boosts. Stay tuned!
          </Text>
          <Button 
            title="GO TO FRIENDS"
            onPress={() => this.props.navigation.navigate('Friends')}
            titleStyle={styles.ignoreBtnTitleStyle}
            buttonStyle={styles.ignoreBtnStyle}
            containerStyle={styles.ignoreBtnContainerStyle}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
          {this.props.friendRequests && this.props.friendRequests.length > 0 && (
            <Button 
              title="SEE MORE REQUESTS"
              onPress={() => this.props.navigation.navigate('Friends')}
              titleStyle={styles.ignoreBtnTitleStyle}
              buttonStyle={styles.ignoreBtnStyle}
              containerStyle={styles.ignoreBtnContainerStyle}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}          
            />
          )}
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
          <Text style={styles.headerTitle}>Buddy Requests</Text>
        </View>
        <ScrollView style={styles.scrollInner} containerStyle={styles.scrollContainer}>
          {this.state.sentRequests && this.state.sentRequests.length > 0 && this.renderSentRequests()}
          <Text style={styles.subsectionTitle}>
            Buddy requests to you
          </Text>
          {this.state.receivedRequests && this.state.receivedRequests.length > 0 && this.renderReceivedRequests()}
          <Text style={styles.receivedFooter}>
            <Text style={styles.boldFooter}>Don’t see a request you were expecting?</Text>
            {' '}It might not have matched your Jupiter contact details.
            {' '}<Text onPress={() => this.setState({ showInputRequestCodeModal: true})} style={styles.footerLink}>Check here</Text>
          </Text>
        </ScrollView>
        {this.renderSentInviteModal()}
        {this.renderAcceptanceModal()}
        {this.renderIgnoreModal()}
        {this.renderFinishedModal()}
        {this.renderInputRequestCodeModal()}
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
  },
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollInner: {
  },
  subsectionTitle: {
    width: '100%',
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    textTransform: 'uppercase',
    paddingHorizontal: 15,
    marginBottom: 5,
    marginTop: 20,
  },
  requestContainer: {
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    minHeight: 60,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  requestWithSeparator: {
    borderBottomColor: Colors.LIGHT_GRAY,
    borderBottomWidth: 1,
  },
  requestTextHolder: {
    flex: 1,
    paddingLeft: 5,
    alignItems: 'flex-start',
  },
  requestPersonName: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.DARK_GRAY,
  },
  requestPersonSubtitle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
  },
  requestButtonHolder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestTxtButtonText: {
    color: Colors.PURPLE,
    textTransform: 'uppercase',
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    marginLeft: 5,
  },
  acceptBtnStyle: {
    marginLeft: 10,
    borderRadius: 4,
    paddingHorizontal: 15,
  },
  acceptBtnTitleStyle: {
    fontFamily: 'poppins-semibold',
    color: Colors.WHITE,
    fontSize: 14,
  },
  padder: {
    minHeight: 20,
  },
  receivedFooter: {
    paddingHorizontal: 15,
    marginTop: 15,
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 13,
  },
  boldFooter: {
    fontFamily: 'poppins-semibold',
  },
  footerLink: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
  },
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    paddingBottom: 15,
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
  modalFooterLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
    textAlign: 'center',
    marginTop: 10,
  },
  ignoreBtnContainerStyle: {
    marginTop: 20,
    paddingHorizontal: 15,
    minWidth: '80%',
  },
  ignoreBtnStyle: {
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  ignoreBtnTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  requestCodeInputWrapperStyle: {
    backgroundColor: Colors.WHITE,
    minHeight: 50,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    borderWidth: 1,
    marginVertical: 10,
    paddingTop: 5,
  },
  requestCodeInputContainerStyle: {
    borderBottomWidth: 0,
  },
  requestCodeInputStyle: {
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 14,
  },
  requestCodeTitleStyle: {
    fontFamily: 'poppins-semibold',
    color: Colors.WHITE,
    fontSize: 16,
  },
  requestCodeBtnStyle: {
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  codeNotFoundSubTitle: {
    fontFamily: 'poppins-regular',
    fontWeight: '600',
    color: Colors.DARK_GRAY,
    lineHeight: 22,
    fontSize: 15,
    textAlign: 'center',
  },
  codeNotFoundBody: {
    marginTop: 10,
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  supportLinkText: {
    marginTop: 10,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
    color: Colors.PURPLE,
  },
});

export default connect(mapStateToProps, mapPropsToDispatch)(FriendRequestList);
