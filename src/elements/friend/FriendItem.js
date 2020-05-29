import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

import { Colors } from '../../util/Values';
import { obtainColorForHeat } from '../../modules/friend/friend.helper';

const FriendItem = ({ friend, index, chevronVisible, onPressViewFriend }) => {
  if (!friend) { // just in case
    return null;
  }

  const friendName = friend.relationshipId === 'SELF' ? 'You' :
    `${friend.calledName || friend.personalName} ${friend.familyName}`;
  
  const { savingHeat, lastActivityMoment } = friend;

  const lastAction = lastActivityMoment ? `Saved on ${lastActivityMoment.format('D MMMM')}` : null;

  return (
    <TouchableOpacity 
      style={styles.friendItemWrapper} 
      disabled={typeof onPressViewFriend !== 'function'}
      onPress={() => onPressViewFriend(friend)}
    >
      {typeof index === 'number' && <Text style={styles.friendItemIndex}>{index}</Text>}
      <View style={styles.friendItemBodyWrapper}>
        <Text style={styles.friendItemName}>{friendName}</Text>
        {lastAction && <Text style={styles.friendItemSubtitle}>{lastAction}</Text>}
      </View>
      <View style={styles.friendItemHeat}>
        <Icon
          name="circle-o"
          type="font-awesome"
          size={30}
          color={obtainColorForHeat(savingHeat)}
        />
      </View>
      {chevronVisible && (
        <Icon
          name="chevron-right"
          type="evilicon"
          size={30}
          color={Colors.MEDIUM_GRAY}
        />
      )}
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  friendItemWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    minWidth: '100%',
    minHeight: 55,
    marginTop: 5,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  friendItemIndex: {
    marginLeft: 18,
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
  },
  friendItemBodyWrapper: {
    marginStart: 18, 
    maxHeight: '100%',
    maxWidth: '70%',
  },
  friendItemName: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  friendItemSubtitle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
  },
  friendItemHeat: {
    flexGrow: 1,
    alignItems: 'flex-end',
  },
})

export default FriendItem;
