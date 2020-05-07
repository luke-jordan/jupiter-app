import React from 'react';

import { View, Text, Switch, StyleSheet } from 'react-native';
import { Overlay, Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

export default class FriendInviteModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      shareActivity: true,
      shareBalance: false,
    }
  }

  async componentWillUnmount() {
    this.setState({ loading: false });
  }

  changeField = (field, value) => {
    this.setState({ [field]: value });
  }

  submitInvite = () => {
    this.setState({ loading: true });
    const sharingLevel = { shareActivity: this.state.shareActivity, shareValue: this.state.shareBalance };
    this.props.onSubmitAcceptance(sharingLevel);
  }

  render() {
    const btnTitle = this.props.inviteType === "RECEIVING" ? "ADD SAVING BUDDY" : "INVITE SAVING BUDDY";

    return (
      <Overlay
        isVisible={this.props.isVisible}
        animationType="fade"
        width="auto"
        height="auto"
        onRequestClose={this.props.onRequestClose}
        onBackdropPress={this.props.onRequestClose}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>
            Add Saving Buddy
          </Text>
          <Text style={styles.modalBody}>
            Share the following with {this.props.relevantUserName}:
          </Text>
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
            title={btnTitle}
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

        </View>
      </Overlay>
    )
  }

}

const styles = StyleSheet.create({
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
  sharingOptionWrapper: {
    backgroundColor: Colors.WHITE,
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
    minWidth: '80%',
  },
  sendInviteBtnStyle: {
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  sendInviteBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.WHITE,
  },
});