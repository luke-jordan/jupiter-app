import React from 'react';

import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Overlay } from 'react-native-elements';

import moment from 'moment';

import { Colors } from '../../util/Values';

import { SAVING_HEAT_LEVELS } from '../../modules/friend/friend.constant';
import { obtainColorForHeat, obtainDescriptionForHeat } from '../../modules/friend/friend.helper';

export default class FriendViewModal extends React.PureComponent {

  renderHeatCircle = savingHeat => (
    <View style={styles.heatHolder} key={savingHeat}>
      <Icon
        name="circle-o"
        type="font-awesome"
        size={30}
        color={obtainColorForHeat(savingHeat)}
      />
      <Text style={[styles.heatDescription, { color: obtainColorForHeat(savingHeat) }]}>
        {obtainDescriptionForHeat(savingHeat)}
      </Text>
    </View>
  );

  // leaving this here for now as may reuse some stuff on sharing options
  // renderSharingOptions() {
  //         <View style={styles.sharingOptionWrapper}>
  //           <Text style={styles.sharingOptionLabel}>How much you save</Text>
  //           <Switch
  //             trackColor={Colors.PURPLE}
  //             value={this.state.friendToShow.shareAmount}
  //           />
  //         </View>
  //         <Text style={styles.modalFooterText}>
  //           You can remove this saving buddy. Note: this cannot be undone, except by sending a new buddy request.
  //         </Text>
  //         <Text style={styles.modalFooterLink} onPress={this.onPressDeactivateFriend}>
  //           Deactivate friendship
  //         </Text>
  //       </View>
  // }

  render() {
    const { friend } = this.props;
    if (!friend) {
      return null;
    }

    const isSelf = friend.relationshipId === 'SELF';

    const { savingHeat, lastActivity, calledName, personalName } = friend;

    let subtitle = null;
    if (!isSelf) {
      subtitle = `${calledName || personalName} and you have been saving buddies since ${moment(friend.creationTime).format('D MMMM')}`;
    }

    let lastSaveDescription = null;
    if (lastActivity && lastActivity.USER_SAVING_EVENT && lastActivity.USER_SAVING_EVENT.creationTime) {
      lastSaveDescription = moment(lastActivity.USER_SAVING_EVENT.creationTime).fromNow();
    }

    return this.props.isVisible ? (
      <Overlay
        isVisible={this.props.isVisible}
        animationType="fade"
        width="90%"
        height="auto"
        onBackdropPress={this.props.onRequestClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isSelf ? 'You' : `${calledName || personalName} ${friend.familyName}`}
            </Text>
          </View>
          <View style={styles.modalBody}>
            {!isSelf && <Text style={styles.modalBodyText}>{subtitle}</Text>}
            {!isSelf && (
              <View style={styles.activityHolder}>
                {lastSaveDescription && (
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>Last time saved</Text>
                    <Text style={styles.activityValue}>{lastSaveDescription}</Text>
                  </View>
                )}
                <View style={styles.activityRow}>
                  <Text style={styles.activityLabel}>Mutual friends</Text>
                  <Text style={styles.activityValue}>{friend.numberOfMutualFriends}</Text>
                </View>
              </View>
            )}
            <View style={styles.heatHolder}>
              <Text style={styles.heatTitle}>Jupiter Saving Heat - {obtainDescriptionForHeat(savingHeat)}</Text>
              <Text style={styles.modalBodyText}>
                This is based on savings growth rate, as well as boost activity and number of saving buddies.
              </Text>
            </View>
            <View style={styles.heatCircles}>
              {/* Multiplier is just to ensure no fragility creeps in around gteq vs gt (use multiplier to avoid enforcing linear scale) */}
              {SAVING_HEAT_LEVELS.map((heat) => this.renderHeatCircle(heat * 1.1))}
            </View>
          </View>
          {!isSelf && (
            <View style={styles.modalFooterText}>
              <Text style={styles.modalFooterLink} onPress={() => this.props.onRemoveFriend(friend.relationshipId)}>
                Remove Buddy
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.closeDialog} onPress={this.props.onRequestClose}>
            <Image source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>
      </Overlay>
    ) : null;
  }

}

const styles = StyleSheet.create({
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    maxWidth: '90%',
  },  
  modalHeader: {
    textAlign: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  modalTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    flex: 1,
    marginBottom: 10,
  },
  modalBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
  },
  modalBodyText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
  },
  activityHolder: {
    borderRadius: 10,
    backgroundColor: Colors.BACKGROUND_GRAY,
    marginVertical: 10,
    padding: 10,
  },
  activityRow: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
  },
  activityLabel: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 12,
  },
  activityValue: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    fontSize: 12,
    textAlign: 'right',
    flex: 1,
  },
  heatTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  heatCircles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  heatDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  modalFooterText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
    marginTop: 10,
    lineHeight: 20,
    marginBottom: 5,
  },
  modalFooterLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
    textAlign: 'center',
    marginTop: 10,
  },
  closeDialog: {
    position: 'absolute',
    top: 5,
    right: 0,
  },
  // sharingOptionWrapper: {
  //   backgroundColor: Colors.WHITE,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingVertical: 14,
  //   borderBottomColor: Colors.LIGHT_GRAY,
  //   borderBottomWidth: 1,
  // },
  // sharingOptionLabel: {
  //   fontFamily: 'poppins-regular',
  //   color: Colors.DARK_GRAY,
  //   fontSize: 14,
  //   flex: 1,
  // },
});
